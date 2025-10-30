package processor.main.java.io.github.jacobwoodbury.centroidFinder;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.PrintWriter;
import java.util.List;
import javax.imageio.ImageIO;
import org.bytedeco.javacv.*;
import org.bytedeco.librealsense.frame;
import org.bytedeco.javacv.*;
import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.global.opencv_imgcodecs;
import org.bytedeco.opencv.helper.opencv_core.*;




public class videoTest {
    public static void main(String[] args){

        System.out.println("This is the path" +args[0]);
        
        try (FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(args[0]); Java2DFrameConverter toBufferedImage = new Java2DFrameConverter();){
            grabber.start();
            Frame frame = grabber.grabImage();
            if(frame != null){
                BufferedImage image = toBufferedImage.convert(frame);

                ImageIO.write(image, "png", new File("test_file.png"));

            }

        } catch (Exception e) {
            // TODO: handle exception
        }
    }
}
