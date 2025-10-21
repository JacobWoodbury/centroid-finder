import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.awt.image.BufferedImage;
import java.util.List;

/**
 
Tests the BinarizingImageGroupFinder class.*
This test builds a small artificial image, uses the DistanceImageBinarizer
and DfsBinaryGroupFinder, and checks that connected white pixel groups
are correctly found and sorted.*/
public class BinarizingImageGroupFinderTest {

    @Test
    public void testFindConnectedGroups_singleWhiteBlock() {
        // Arrange: create a 3x3 image with one white block in the middle
        BufferedImage img = new BufferedImage(3, 3, BufferedImage.TYPE_INT_RGB);

        int black = 0x000000;
        int white = 0xFFFFFF;

        // fill with black
        for (int y = 0; y < 3; y++)
            for (int x = 0; x < 3; x++)
                img.setRGB(x, y, black);

        // make a 2x2 white block in the center
        img.setRGB(1, 1, white);
        img.setRGB(1, 2, white);
        img.setRGB(2, 1, white);
        img.setRGB(2, 2, white);

        // Use a small threshold so exact white matches only
        ColorDistanceFinder distanceFinder = new EuclideanColorDistance();
        ImageBinarizer binarizer = new DistanceImageBinarizer(distanceFinder, white, 0);
        BinaryGroupFinder groupFinder = new DfsBinaryGroupFinder();

        BinarizingImageGroupFinder finder = new BinarizingImageGroupFinder(binarizer, groupFinder);

        // Act
        List<Group> groups = finder.findConnectedGroups(img);

        // Assert
        assertEquals(1, groups.size(), "Should find exactly one group");
        Group g = groups.get(0);
        assertEquals(4, g.size(), "Group should contain 4 connected white pixels");
        assertNotNull(g.centroid(), "Centroid should not be null");
    }
@Test
    public void testFindConnectedGroups_twoSeparateWhitePixels() {
        // Arrange: create a 3x3 image with two isolated white pixels
        BufferedImage img = new BufferedImage(3, 3, BufferedImage.TYPE_INT_RGB);

        int black = 0x000000;
        int white = 0xFFFFFF;

        for (int y = 0; y < 3; y++)
            for (int x = 0; x < 3; x++)
                img.setRGB(x, y, black);

        img.setRGB(0, 0, white);
        img.setRGB(2, 2, white);

        ColorDistanceFinder distanceFinder = new EuclideanColorDistance();
        ImageBinarizer binarizer = new DistanceImageBinarizer(distanceFinder, white, 0);
        BinaryGroupFinder groupFinder = new DfsBinaryGroupFinder();
        BinarizingImageGroupFinder finder = new BinarizingImageGroupFinder(binarizer, groupFinder);

        // Act
        List<Group> groups = finder.findConnectedGroups(img);

        // Assert
        assertEquals(2, groups.size(), "Should find two separate groups");
        assertTrue(groups.stream().allMatch(g -> g.size() == 1), "Each group should contain 1 pixel");
    }

    @Test
    public void testFindConnectedGroups_allBlackImage() {
        // Arrange
        BufferedImage img = new BufferedImage(3, 3, BufferedImage.TYPE_INT_RGB);
        int black = 0x000000;
        for (int y = 0; y < 3; y++)
            for (int x = 0; x < 3; x++)
                img.setRGB(x, y, black);

        ColorDistanceFinder distanceFinder = new EuclideanColorDistance();
        ImageBinarizer binarizer = new DistanceImageBinarizer(distanceFinder, 0xFFFFFF, 0);
        BinaryGroupFinder groupFinder = new DfsBinaryGroupFinder();
        BinarizingImageGroupFinder finder = new BinarizingImageGroupFinder(binarizer, groupFinder);

        // Act
        List<Group> groups = finder.findConnectedGroups(img);

        // Assert
        assertTrue(groups.isEmpty(), "No white groups should be found in an all-black image");
    }
}