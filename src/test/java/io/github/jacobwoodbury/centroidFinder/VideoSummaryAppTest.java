package io.github.jacobwoodbury.centroidFinder;
import org.junit.jupiter.api.*;
import java.io.*;

import static org.junit.jupiter.api.Assertions.*;

class VideoSummaryAppTest {
        
    //Declares the capture to create temporary storage for terminal outputs
    private ByteArrayOutputStream outContent;
    private ByteArrayOutputStream errContent;
    private PrintStream originalOut;
    private PrintStream originalErr;

    //setup before each test
    @BeforeEach
    void setUpStreams() {
        //creates the space
        outContent = new ByteArrayOutputStream();
        errContent = new ByteArrayOutputStream();
        //stores the output and error
        originalOut = System.out;
        originalErr = System.err;
        //redirects the message to write into the tests
        System.setOut(new PrintStream(outContent));
        System.setErr(new PrintStream(errContent));
    }

    @AfterEach
    void restoreStreams() {
        //cleans to the original value after each test
        System.setOut(originalOut);
        System.setErr(originalErr);
    }

    @Test
    void testMissingArgs() {
        VideoSummaryApp.main(new String[]{});
        assertTrue(outContent.toString().contains("Usage:"));
    }

    @Test
    void testInvalidThreshold() {
        VideoSummaryApp.main(new String[]{"input.mp4", "output.csv", "FF0000", "abc"});
        assertTrue(errContent.toString().contains("Threshold must be an integer"));
    }

    @Test
    void testInvalidHexColor() {
        VideoSummaryApp.main(new String[]{"input.mp4", "output.csv", "ZZZZZZ", "50"});
        assertTrue(errContent.toString().contains("Invalid hex target color"));
    }

    @Test
    void testInvalidInputFile() {
        // file doesn't exist
        VideoSummaryApp.main(new String[]{"fake.mp4", "output.csv", "FF0000", "50"});
        assertTrue(errContent.toString().contains("Unexpected error"));
    }
}
