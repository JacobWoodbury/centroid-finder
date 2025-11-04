package processor.src.main.java.io.github.jacobwoodbury.centroidFinder;

public class EuclideanColorDistance implements ColorDistanceFinder {
    /**
     * Returns the euclidean color distance between two hex RGB colors.
     * 
     * Each color is represented as a 24-bit integer in the form 0xRRGGBB, where
     * RR is the red component, GG is the green component, and BB is the blue component,
     * each ranging from 0 to 255.
     * 
     * The Euclidean color distance is calculated by treating each color as a point
     * in 3D space (red, green, blue) and applying the Euclidean distance formula:
     * 
     * sqrt((r1 - r2)^2 + (g1 - g2)^2 + (b1 - b2)^2)
     * 
     * This gives a measure of how visually different the two colors are.
     * 
     * @param colorA the first color as a 24-bit hex RGB integer
     * @param colorB the second color as a 24-bit hex RGB integer
     * @return the Euclidean distance between the two colors
     */
    @Override
    public double distance(int colorA, int colorB) {
        int mask = 0xFF;
        int r1 = (colorA >> 16) & mask;
        int g1 = (colorA >> 8) & mask;
        int b1 = colorA & mask;
        int r2 = (colorB >> 16) & mask;
        int g2 = (colorB >> 8) & mask;
        int b2 = colorB & mask;

        
        double red = (r1-r2);
        double green = (g1-g2);
        double blue = (b1-b2);
        
        double distance = Math.sqrt(Math.pow((red), 2.0)+Math.pow((green), 2.0)+Math.pow((blue), 2.0));

        return distance;
    }
}
