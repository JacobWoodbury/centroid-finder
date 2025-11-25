package io.github.jacobwoodbury.centroidFinder;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.awt.image.BufferedImage;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FrameProcessorTest {

    private StringWriter stringWriter;
    private PrintWriter writer;

    @Mock
    private ColorDistanceFinder distanceFinder;
    @Mock
    private ImageGroupFinder groupFinder;

    private FrameProcessor processor;

    @BeforeEach
    void setUp() {
        stringWriter = new StringWriter();
        writer = new PrintWriter(stringWriter);

        // Subclass to override createGroupFinder
        processor = new FrameProcessor() {
            @Override
            protected ImageGroupFinder createGroupFinder(int targetColor, int threshold,
                    ColorDistanceFinder distanceFinder) {
                return groupFinder;
            }
        };
    }

    @Test
    void testProcessImage_NoGroupsFound() {
        double timeStamp = 1.0;
        BufferedImage mockImage = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
        when(groupFinder.findConnectedGroups(mockImage)).thenReturn(Collections.emptyList());

        processor.processImage(mockImage, timeStamp, writer, 0xFF0000, 10, distanceFinder);

        String output = stringWriter.toString().trim();
        // Use regex or exact match depending on locale formatting (%.2f might use comma
        // in some locales, but Java usually uses dot unless specified)
        // String.format uses default locale. If user is in US, it's dot.
        // Let's assume dot for now or check regex.
        // "1.00 -1 -1"
        assertEquals("1.00 -1 -1", output);
    }

    @Test
    void testProcessImage_GroupFound() {
        double timeStamp = 2.5;
        BufferedImage mockImage = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);

        Group group = new Group(100, new Coordinate(10, 20));
        when(groupFinder.findConnectedGroups(mockImage)).thenReturn(List.of(group));

        processor.processImage(mockImage, timeStamp, writer, 0xFF0000, 10, distanceFinder);

        String output = stringWriter.toString().trim();
        assertEquals("2.50 10 20", output);
    }
}
