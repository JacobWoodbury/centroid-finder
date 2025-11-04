package processor.src.main.java.io.github.jacobwoodbury.centroidFinder;

import java.awt.image.BufferedImage;
import java.io.PrintWriter;
import java.util.List;
import org.bytedeco.javacv.*;



public class VideoSummaryApp {
    public static void main(String args[]){
//handle Args
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
           
               
            while(frame != null){
                FrameProcessor processor = new FrameProcessor();
                processor.process(frame, writer, targetColor, threshold, toBufferedImage);
               
                frame = grabber.grabImage();
            }
            
        }catch(Exception e){
            System.err.println("Unexpected error: " + e.getMessage());
        }

    }
}
