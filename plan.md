# plan

- Set up our variables from args/check correct args
  -inputPath outputCsv targetColor threshold
- setup our ffmpegGrabber and FrameConverter to get a Buffered image
  start the grabber, and loop through frames
  Create csv output file
  for each frame

- capture frame.timestamp
- Buffered image conversion
- Create the DistanceImageBinarizer with a EuclideanColorDistance instance.
- Binarize image
- use dfsGfinder to get the grouplist for the frame
- grab the biggest group (sorted should be at the top)
- using timestamp, group x, and group y Print to the outpust csv row (adding to file not creating a new one)
- grab next frame


Tracking live salamander validation:
  We went through the video and used a colorpicker to check the color of the salamander.
  Next we found points in the video where the salamander was at a unique position, and compared x and y in the csv at that second.
  to pick a threshold, we can use a colorpicker on the closest color that is not a salamander, and compare the distance. 