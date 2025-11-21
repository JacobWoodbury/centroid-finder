package io.github.jacobwoodbury.centroidFinder;

import java.io.PrintWriter;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;

/**
 * Main entry point for the video summary application.
 *
 * This application reads a video file, detects the centroid of a specified target color
 * in each frame, and writes the results to a CSV file.
 */
public class VideoSummaryApp {

    /**
     * Runs the application.
     *
     * Usage: java VideoSummaryApp <input_path> <outputCsv> <hex_target_color> <threshold>
     *
     * Arguments:
     * - input_path: Path to the source video file.
     * - outputCsv: Path where the output CSV will be written.
     * - hex_target_color: The target RGB color in hex format (e.g., FF0000 for red).
     * - threshold: The integer distance threshold for color matching.
     *
     * @param args Command-line arguments as inputpath, outputCSV, color as hex, and threshold
     */
    public static void main(String[] args) {
        if (args.length < 4) {
            System.out.println("Usage: java VideoSummaryApp <input_path> <outputCsv> <hex_target_color> <threshold>");
            return;
        }

        String inputPath = args[0];
        String outputCsv = args[1];
        String hexTargetColor = args[2];
        int threshold;

        try {
            threshold = Integer.parseInt(args[3]);
        } catch (NumberFormatException e) {
            System.err.println("Threshold must be an integer.");
            return;
        }

        int targetColor;
        try {
            // Parse hex string (RRGGBB) into integer
            targetColor = Integer.parseInt(hexTargetColor, 16);
        } catch (NumberFormatException e) {
            System.err.println("Invalid hex target color. Please provide a color in RRGGBB format.");
            return;
        }
        
        // Initialize resources: FrameGrabber, Converter, and PrintWriter
        try (FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(inputPath);
             Java2DFrameConverter toBufferedImage = new Java2DFrameConverter(); 
             PrintWriter writer = new PrintWriter(outputCsv)) {

            grabber.start();
            
            Frame frame = grabber.grabImage();
            ColorDistanceFinder distanceFinder = new EuclideanColorDistance();
            FrameProcessor processor = new FrameProcessor();

            while (frame != null) {
                processor.process(frame, writer, targetColor, threshold, toBufferedImage, distanceFinder);
                frame = grabber.grabImage();
            }
            
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
        }
    }
}