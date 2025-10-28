package io.github.jacobwoodbury.centroidFinder;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.PrintWriter;
import java.util.List;
import javax.imageio.ImageIO;
import org.bytedeco.javacv.*;



public class VideoSummaryApp {
    public static void main(String args[]){

if (args.length < 4) {
            System.out.println("Usage: java VideoSummaryApp <input_path> <outputCsv> <hex_target_color> <threshold>");
            return;
        }
        String inputPath = args[0];
        String outputCsv = args[1];
        String hexTargetColor = args[2];
        int threshold = 0;

        try {
            threshold = Integer.parseInt(args[3]);
        } catch (NumberFormatException e) {
            System.err.println("Threshold must be an integer.");
            return;
        }

        BufferedImage inputImage = null;
        try {
            inputImage = ImageIO.read(new File(inputPath));
        } catch (Exception e) {
            System.err.println("Error loading image: " + inputPath);
            e.printStackTrace();
            return;
        }

         // Parse the target color from a hex string (format RRGGBB) into a 24-bit integer (0xRRGGBB)
        int targetColor = 0;
        try {
            targetColor = Integer.parseInt(hexTargetColor, 16);
        } catch (NumberFormatException e) {
            System.err.println("Invalid hex target color. Please provide a color in RRGGBB format.");
            return;
        }
        
        //setting up ffmpeg...
        try (FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(inputPath); Java2DFrameConverter toBufferedImage = new Java2DFrameConverter(); PrintWriter writer = new PrintWriter(outputCsv);){
            grabber.start();
            Frame frame = grabber.grabImage();
            int timeStamp;
           
               
            while(frame != null){
                //grab timestamp
                timeStamp = (int) (frame.timestamp/100000);
                //Buffered image conversion
                BufferedImage image = toBufferedImage.convert(frame);
                //Create the DistanceImageBinarizer with a EuclideanColorDistance instance.
                ColorDistanceFinder distanceFinder = new EuclideanColorDistance();
            ImageBinarizer binarizer = new DistanceImageBinarizer(distanceFinder, targetColor, threshold);
                //binarize image
                int[][] binaryArray = binarizer.toBinaryArray(image);

                //create groupFinder
                ImageGroupFinder groupFinder = new BinarizingImageGroupFinder(binarizer, new DfsBinaryGroupFinder());

                //get groups
                List<Group> groups = groupFinder.findConnectedGroups(inputImage);

                //grab the first (largest)

                //pring to our csv in (timestamp, x, y) as a row

                //grab the next frame


            }
            
        } catch (Exception e) {
            // TODO: handle exception
        }

    }
}
