package io.github.jacobwoodbury.centroidFinder;
import java.awt.image.BufferedImage;
import java.io.PrintWriter;
import java.util.List;
import io.github.jacobwoodbury.centroidFinder.Group;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;

/**
 * Processes individual video frames to find and record the centroid of a target color group.
 */
public class FrameProcessor {

    /**
     * Processes a single frame, locates the largest group of the target color, 
     * and writes the result to the provided writer.
     *
     * @param frame           The video frame to process.
     * @param writer          The PrintWriter to write the CSV output to.
     * @param targetColor     The target RGB color to search for.
     * @param threshold       The color distance threshold.
     * @param toBufferedImage Converter for JavaCV frames.
     * @param distanceFinder  Strategy for color comparison.
     */
    public void process(Frame frame, PrintWriter writer, int targetColor, int threshold, Java2DFrameConverter toBufferedImage, ColorDistanceFinder distanceFinder){
        double timeStamp = (double) (frame.timestamp / 1000000.0);
        
        BufferedImage image = toBufferedImage.convert(frame);
       
        ImageBinarizer binarizer = new DistanceImageBinarizer(distanceFinder, targetColor, threshold);
        ImageGroupFinder groupFinder = new BinarizingImageGroupFinder(binarizer, new DfsBinaryGroupFinder());
        
        List<Group> groups = groupFinder.findConnectedGroups(image);

        // If no groups are found, write -1 -1, otherwise write the centroid of the largest group
        if (groups.isEmpty()) {
            writer.println(String.format("%.2f -1 -1", timeStamp));
        } else {
            Group largest = groups.get(0);
            writer.println(String.format("%.2f %d %d", timeStamp, largest.centroid().x(), largest.centroid().y()));
        }
        writer.flush();
    }
}
