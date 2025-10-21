import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.awt.image.BufferedImage;
import java.io.Console;

class DistanceImageBinarizerTest {

    @Test
    void testToBinaryArray_AllPixelsBelowThreshold() {
        // Mock ColorDistanceFinder that always returns a small distance
        ColorDistanceFinder mockFinder = (color1, color2) -> 50.0;

        // Create 2x2 image
        BufferedImage image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);

        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(mockFinder, 0xFFFFFF, 150);
        int[][] result = binarizer.toBinaryArray(image);

        // Expect all pixels to be white (1)
        for (int r = 0; r < result.length; r++) {
            for (int c = 0; c < result[0].length; c++) {
                assertEquals(1, result[r][c]);
            }
        }
    }

    @Test
    void testToBinaryArray_AllPixelsAboveThreshold() {
        // Mock ColorDistanceFinder that always returns a large distance
        ColorDistanceFinder mockFinder = (color1, color2) -> 255.0;

        BufferedImage image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(mockFinder, 0xFFFFFF, 150);

        int[][] result = binarizer.toBinaryArray(image);

        // Expect all pixels to be black (0)
        for (int[] row : result) {
            for (int value : row) {
                assertEquals(0, value);
            }
        }
    }

    @Test
    void testToBinaryArray_MixedPixels() {
        // Alternating distances
        ColorDistanceFinder mockFinder = (color1, color2) -> (color1 == color2) ? 0 : 200.0;

        BufferedImage image = new BufferedImage(2, 1, BufferedImage.TYPE_INT_RGB);
        image.setRGB(0, 0, 0x000000); // distance 0 → 1
        image.setRGB(1, 0, 0xFFFFFF); // distance 200 → 0

        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(mockFinder, 0x000000, 150);
        int[][] result = binarizer.toBinaryArray(image);
        System.out.println(result[0]);

        
        assertEquals(1, result[0][0]);
        assertEquals(0, result[0][1]);
    }

    @Test
    void testToBinaryArray_ReturnsArrayWithSameDimensions() {
        ColorDistanceFinder mockFinder = (color1, color2) -> 100.0;

        BufferedImage image = new BufferedImage(3, 5, BufferedImage.TYPE_INT_RGB);
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(mockFinder, 0x000000, 150);
        int[][] result = binarizer.toBinaryArray(image);

        assertEquals(5, result.length);       // height
        assertEquals(3, result[0].length);    // width
    }

    @Test
    void testToBufferedImage_AllWhitePixels() {
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer((a, b) -> 0.0, 0x000000, 100);

        int[][] binaryArray = {
            {1, 1},
            {1, 1}
        };

        BufferedImage image = binarizer.toBufferedImage(binaryArray);

        // Expect each pixel to be white (0xFFFFFF)
        for (int r = 0; r < binaryArray.length; r++) {
            for (int c = 0; c < binaryArray[0].length; c++) {
                assertEquals(0xFFFFFFFF, image.getRGB(r, c));
            }
        }
    }

    @Test
    void testToBufferedImage_AllBlackPixels() {
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer((a, b) -> 0.0, 0x000000, 100);

        int[][] binaryArray = {
            {0, 0},
            {0, 0}
        };

        BufferedImage image = binarizer.toBufferedImage(binaryArray);

        // Expect each pixel to be black (0x000000)
        for (int r = 0; r < binaryArray.length; r++) {
            for (int c = 0; c < binaryArray[0].length; c++) {
                assertEquals(0xFF000000, image.getRGB(r, c));
            }
        }
    }

  @Test
void testToBufferedImage_MixedPixels() {
    DistanceImageBinarizer binarizer = new DistanceImageBinarizer((a, b) -> 0.0, 0x000000, 100);

    // Use asymmetrical data: a rectangle or non-symmetrical values
    int[][] binaryArray = {
        {1, 0}, // row 0: white, black
        {1, 1}  // row 1: white, white
    };

    BufferedImage image = binarizer.toBufferedImage(binaryArray);

   
    assertEquals(0xFFFFFFFF, image.getRGB(0, 0)); 
    assertEquals(0xFF000000, image.getRGB(1, 0)); 
    assertEquals(0xFFFFFFFF, image.getRGB(0, 1)); 
    assertEquals(0xFFFFFFFF, image.getRGB(1, 1)); 
}

    @Test
    void testToBufferedImage_DimensionsMatch() {
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer((a, b) -> 0.0, 0x000000, 100);

        int[][] binaryArray = new int[5][3]; // width = 3, height = 5
        BufferedImage image = binarizer.toBufferedImage(binaryArray);

      
        assertEquals(3, image.getWidth());
        assertEquals(5, image.getHeight());
    }

    @Test
void testToBinaryArray_PixelsOnThreshold() {
    // Mock finder that returns a distance exactly equal to the threshold
    ColorDistanceFinder mockFinder = (color1, color2) -> 150.0;

    BufferedImage image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
    DistanceImageBinarizer binarizer = new DistanceImageBinarizer(mockFinder, 0xFFFFFF, 150);

    int[][] result = binarizer.toBinaryArray(image);

    // Because the logic is <=, pixels on the threshold should be white (1)
    assertArrayEquals(new int[]{1, 1}, result[0]);
    assertArrayEquals(new int[]{1, 1}, result[1]);
}

}
