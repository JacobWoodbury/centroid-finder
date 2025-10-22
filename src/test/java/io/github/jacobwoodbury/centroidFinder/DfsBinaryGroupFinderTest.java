package io.github.jacobwoodbury.centroidFinder;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class DfsBinaryGroupFinderTest {

    private DfsBinaryGroupFinder groupFinder;

    @BeforeEach
    void setUp() {
        groupFinder = new DfsBinaryGroupFinder();
    }

    @Test
    @DisplayName("Should find multiple groups and sort them correctly")
    void findConnectedGroups_multipleGroupsAndSortsCorrectly() {
        // ARRANGE
        int[][] image = {
            {1, 1, 0, 0, 1},
            {0, 1, 1, 0, 1},
            {0, 0, 0, 0, 0},
            {1, 0, 0, 1, 1}
        };

        /*
         * Expected Groups (Manual Calculation):
         * Group A (top-left): size=4, pixels=(0,0),(1,0),(1,1),(2,1). sumX=4, sumY=2. centroid=(4/4, 2/4)=(1,0)
         * Group B (top-right): size=2, pixels=(4,0),(4,1). sumX=8, sumY=1. centroid=(8/2, 1/2)=(4,0)
         * Group C (bottom-left): size=1, pixel=(0,3). sumX=0, sumY=3. centroid=(0/1, 3/1)=(0,3)
         * Group D (bottom-right): size=2, pixels=(3,3),(4,3). sumX=7, sumY=6. centroid=(7/2, 6/2)=(3,3)
         *
         * Sorting Order (size DESC, x DESC, y DESC):
         * 1. Group A (size 4)
         * 2. Group D (size 2, y=0)
         * 3. Group B (size 2, y=3)
         * 4. Group C (size 1)
         */
        List<Group> expectedGroups = List.of(
            new Group(4, new Coordinate(1, 0)),
            new Group(2, new Coordinate(4, 0)),
            new Group(2, new Coordinate(3, 3)),
            new Group(1, new Coordinate(0, 3))
        );

        // ACT
        List<Group> actualGroups = groupFinder.findConnectedGroups(image);

        // ASSERT
        assertNotNull(actualGroups);
        assertEquals(expectedGroups.size(), actualGroups.size(), "Should find the correct number of groups.");
        assertEquals(expectedGroups, actualGroups, "The groups found should match the expected groups in the correct order.");
    }

    @Test
    @DisplayName("Should return an empty list for an image with no groups")
    void findConnectedGroups_noGroupsFound() {
        // ARRANGE
        int[][] image = {
            {0, 0, 0},
            {0, 0, 0},
            {0, 0, 0}
        };

        // ACT
        List<Group> actualGroups = groupFinder.findConnectedGroups(image);

        // ASSERT
        assertNotNull(actualGroups);
        assertTrue(actualGroups.isEmpty(), "The returned list should be empty when no groups are present.");
    }

    @Test
    @DisplayName("Should find a single group covering the entire image")
    void findConnectedGroups_singleLargeGroup() {
        // ARRANGE
        int[][] image = {
            {1, 1, 1},
            {1, 1, 1},
            {1, 1, 1}
        };
        // sumX = (0+1+2) + (0+1+2) = 6
        // sumY = (0+0+0) + (1+1+1) = 3
        // size = 6
        // centroid = (6/6, 3/6) = (1, 0)
        Group expectedGroup = new Group(9, new Coordinate(1, 1));

        // ACT
        List<Group> actualGroups = groupFinder.findConnectedGroups(image);

        // ASSERT
        assertNotNull(actualGroups);
        assertEquals(1, actualGroups.size(), "Should find exactly one group.");
        assertEquals(expectedGroup, actualGroups.get(0), "The single group found should be correct.");
    }

    @Test
    @DisplayName("Should handle complex U-shaped group correctly")
    void findConnectedGroups_complexShape() {
        // ARRANGE
        int[][] image = {
            {1, 0, 1},
            {1, 0, 1},
            {1, 1, 1}
        };
        // size = 7
        // sumX = (0+2) + (0+2) + (0+1+2) = 7
        // sumY = (0+0) + (1+1) + (2+2+2) = 8
        // centroid = (7/7, 8/7) = (1, 1)
        Group expectedGroup = new Group(7, new Coordinate(1, 1));
        
        // ACT
        List<Group> actualGroups = groupFinder.findConnectedGroups(image);

        // ASSERT
        assertEquals(1, actualGroups.size());
        assertEquals(expectedGroup, actualGroups.get(0));
    }

    // --- Exception Handling Tests ---

    @Test
    @DisplayName("Should throw NullPointerException for null image")
    void findConnectedGroups_throwsForNullImage() {
        assertThrows(NullPointerException.class, () -> {
            groupFinder.findConnectedGroups(null);
        }, "A null image should cause a NullPointerException.");
    }

    @Test
    @DisplayName("Should throw NullPointerException for image with null rows")
    void findConnectedGroups_throwsForNullRow() {
        int[][] imageWithNullRow = {{1, 0}, null, {0, 1}};
        assertThrows(NullPointerException.class, () -> {
            groupFinder.findConnectedGroups(imageWithNullRow);
        }, "An image with a null row should cause a NullPointerException.");
    }

    
}
