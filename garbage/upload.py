#!/usr/bin/python

import httplib2
import os
import random
import time

from apiclient.discovery import build
from apiclient.errors import HttpError
from apiclient.http import MediaFileUpload
from oauth2client.client import flow_from_clientsecrets
from oauth2client.file import Storage
from oauth2client.tools import argparser, run_flow

# Explicitly tell the underlying HTTP transport library not to retry, since we are handling retry logic ourselves.
httplib2.RETRIES = 1
MAX_RETRIES = 10
RETRIABLE_EXCEPTIONS = (httplib2.HttpLib2Error, IOError)
RETRIABLE_STATUS_CODES = [500, 502, 503, 504]

CLIENT_SECRETS_FILE = "client_secrets.json"
YOUTUBE_UPLOAD_SCOPE = "https://www.googleapis.com/auth/youtube.upload"
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"
VALID_PRIVACY_STATUSES = ("public", "private", "unlisted")

def get_authenticated_service(client_secrets_file, storage_filename):
    flow = flow_from_clientsecrets(client_secrets_file, scope=YOUTUBE_UPLOAD_SCOPE)
    storage = Storage(storage_filename)
    credentials = storage.get()

    if credentials is None or credentials.invalid:
        credentials = run_flow(flow, storage)

    return build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, http=credentials.authorize(httplib2.Http()))


def initialize_upload(youtube, file_path, title, description, category, keywords, privacy_status):
    tags = keywords.split(",") if keywords else None
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": category
        },
        "status": {
            "privacyStatus": privacy_status
        }
    }
    media_body = MediaFileUpload(file_path, chunksize=-1, resumable=True)
    insert_request = youtube.videos().insert(part=",".join(body.keys()), body=body, media_body=media_body)

    resumable_upload(insert_request)


def resumable_upload(insert_request):
    response = None
    error = None
    retry = 0
    while response is None:
        try:
            print("Uploading file...")
            status, response = insert_request.next_chunk()
            if response is not None and 'id' in response:
                print("Video id '%s' was successfully uploaded." % response['id'])
                return response['id']
            else:
                print("Unexpected response: %s" % response)
        except HttpError as e:
            if e.resp.status in RETRIABLE_STATUS_CODES:
                error = f"A retriable HTTP error {e.resp.status} occurred:\n{e.content}"
            else:
                raise
        except RETRIABLE_EXCEPTIONS as e:
            error = f"A retriable error occurred: {e}"

        if error:
            print(error)
            retry += 1
            if retry > MAX_RETRIES:
                print("No longer attempting to retry.")
                break

            sleep_seconds = random.random() * (2 ** retry)
            print(f"Sleeping {sleep_seconds} seconds and then retrying...")
            time.sleep(sleep_seconds)


def upload_video(file_path, title="Test Title", description="Test Description", category="22", keywords="", privacy_status="public"):
    if not os.path.exists(file_path):
        raise FileNotFoundError("Please specify a valid file.")
    youtube = get_authenticated_service(CLIENT_SECRETS_FILE, "%s-oauth2.json" % CLIENT_SECRETS_FILE.split('.')[0])
    initialize_upload(youtube, file_path, title, description, category, keywords, privacy_status)

upload_video("http://localhost:5000/static/video.mp4", title="My Video", description="A cool video.", category="22", keywords="sample,video", privacy_status="public")

