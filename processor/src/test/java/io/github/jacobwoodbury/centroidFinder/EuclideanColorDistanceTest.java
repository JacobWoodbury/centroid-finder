package processor.test.java.io.github.jacobwoodbury.centroidFinder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class EuclideanColorDistanceTest {

    private EuclideanColorDistance colorDistance;

    @BeforeEach
    public void setUp() {
        colorDistance = new EuclideanColorDistance();
    }

    @Test
    public void testSameColor() {
        int color = 0x112233;
        double expected = 0.0;
        assertEquals(expected, colorDistance.distance(color, color), 1e-6);
    }

    @Test
    public void testBlackAndWhite() {
        int black = 0x000000;
        int white = 0xFFFFFF;
        // Distance = sqrt((255-0)^2*3) = sqrt(3*255^2)
        double expected = Math.sqrt(3 * 255 * 255);
        assertEquals(expected, colorDistance.distance(black, white), 1e-6);
    }

    @Test
    public void testRedAndGreen() {
        int red = 0xFF0000;
        int green = 0x00FF00;
        // Distance = sqrt(255^2 + 255^2 + 0) = sqrt(2*255^2)
        double expected = Math.sqrt(2 * 255 * 255);
        assertEquals(expected, colorDistance.distance(red, green), 1e-6);
    }

    @Test
    public void testRedAndBlue() {
        int red = 0xFF0000;
        int blue = 0x0000FF;
        double expected = Math.sqrt(2 * 255 * 255);
        assertEquals(expected, colorDistance.distance(red, blue), 1e-6);
    }

    @Test
    public void testGreenAndBlue() {
        int green = 0x00FF00;
        int blue = 0x0000FF;
        double expected = Math.sqrt(2 * 255 * 255);
        assertEquals(expected, colorDistance.distance(green, blue), 1e-6);
    }

    @Test
    public void testArbitraryColors() {
        int colorA = 0x123456;
        int colorB = 0x654321;
        // Manually calculate expected distance: sqrt((18-101)^2 + (52-67)^2 + (86-33)^2)
        double expected = Math.sqrt(
            Math.pow(0x12 - 0x65, 2) +
            Math.pow(0x34 - 0x43, 2) +
            Math.pow(0x56 - 0x21, 2)
        );
        assertEquals(expected, colorDistance.distance(colorA, colorB), 1e-6);
    }

    @Test
    public void testMinMaxComponentColors() {
        int colorA = 0x00FF00; // green
        int colorB = 0xFF00FF; // magenta
        // Distance = sqrt((0-255)^2 + (255-0)^2 + (0-255)^2)
        double expected = Math.sqrt(255*255 + 255*255 + 255*255);
        assertEquals(expected, colorDistance.distance(colorA, colorB), 1e-6);
    }

    @Test
    public void testGrayShades() {
        int darkGray = 0x404040;
        int lightGray = 0xC0C0C0;
        double expected = Math.sqrt(3 * Math.pow(0xC0 - 0x40, 2));
        assertEquals(expected, colorDistance.distance(darkGray, lightGray), 1e-6);
    }
}
