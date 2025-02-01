dev:
    hugo server -D --cleanDestinationDir

stg:
    hugo server --bind=0.0.0.0 --baseURL=https://rafaelbroseghini.com/ --appendPort=false --cleanDestinationDir

prod:
    hugo --cleanDestinationDir