from __future__ import division, print_function
# coding=utf-8
import sys
import os
import glob
import re
import numpy as np

# flask
from flask import Flask, jsonify, redirect, url_for, request, render_template
from werkzeug.utils import secure_filename

# pytorch and huggingface
import torch
import transformers
from transformers import BartTokenizer, BartForConditionalGeneration

# youtube api
from youtube_transcript_api import YouTubeTranscriptApi

# Define a flask app
app = Flask(__name__)

# model prediction
def model_predict(data):

    torch_device = 'cuda' if torch.cuda.is_available() else 'cpu'

    tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
    model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')

    article_input_ids = tokenizer.batch_encode_plus([data], return_tensors='pt', max_length=1024)['input_ids'].to(
        torch_device)

    summary_ids = model.generate(article_input_ids,
                                 num_beams=4,
                                 length_penalty=2.0,
                                 max_length=142,
                                 min_len=56,
                                 no_repeat_ngram_size=3)

    summary_txt = tokenizer.decode(summary_ids.squeeze(), skip_special_tokens=True)

    len(summary_txt.split())

    return summary_txt

# routing
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

# API
@app.route('/youtube', methods=['GET','POST'])
def get_video():

    #video = '8M20LyCZDOY'
    # video = request.args.get('videoid')
    # print(video)
    if request.method == 'POST':
        
        # extracting videoid from youtube url
        video_link = request.form.get('video').split('=');
        video_id = video_link[1]
        print(video_id)
        try:
            texti = YouTubeTranscriptApi.get_transcript(video_id)
            print(texti)
            if texti[-1]['start'] + texti[-1]['duration'] > 900:
                return jsonify({'error': 'Videos more than 15 minutes are not supported',
                'status': 'error'})

            data = ''
            for i in texti:
                data = data + ' ' + i['text']
            # print(data)

            datavv = data.replace('\n', '')
            
            # content summary
            model_result = model_predict(datavv)

            video_result = {
                'text': data,
                'summary': model_result
            }
            
            summ_result = jsonify({'video_summary': video_result,
            'status':'Ok'})
            
            return summ_result

        except:
            # error message for wrong youtube url 
            error = jsonify({'error': 'Not found !! It might be due to wrong Youtube Video Url or Captions for this video are disabled',
            'status': 'error'})
            
            return error

        return None

if __name__ == '__main__':
    app.run(debug=True)
