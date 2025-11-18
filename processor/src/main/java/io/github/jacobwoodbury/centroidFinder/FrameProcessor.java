package io.github.jacobwoodbury.centroidFinder;

import java.awt.image.BufferedImage;
import java.io.PrintWriter;
import java.util.List;
import io.github.jacobwoodbury.centroidFinder.Group;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;

public class FrameProcessor {
    public void process(Frame frame, PrintWriter writer, int targetColor, int threshold, Java2DFrameConverter toBufferedImage, ColorDistanceFinder distanceFinder){
         double timeStamp = (double) (frame.timestamp/1000000.0);
            //Buffered image conversion
            BufferedImage image = toBufferedImage.convert(frame);
            //Buffered image colored
            //Create the DistanceImageBinarizer with a EuclideanColorDistance instance.
           
            ImageBinarizer binarizer = new DistanceImageBinarizer(distanceFinder, targetColor, threshold);
            
            //maybe we need to write the B&W image here?           

            //create groupFinder
            ImageGroupFinder groupFinder = new BinarizingImageGroupFinder(binarizer, new DfsBinaryGroupFinder());
            //get groups
            //B&W BuffImg => groups
            List<Group> groups = groupFinder.findConnectedGroups(image);

            //grab the first (largest)
            
            //print to our csv in (timestamp, x, y) as a row
            if(groups.isEmpty()){
                writer.println(timeStamp + "-1 -1");
            }else{
                Group largest = groups.get(0);
                writer.println(String.format("%.2f", timeStamp) + " "+ largest.centroid().x() + " " + largest.centroid().y());
            }
            writer.flush();
            //grab the next frame
    }
}
