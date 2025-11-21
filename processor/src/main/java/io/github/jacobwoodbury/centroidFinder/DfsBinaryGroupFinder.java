package io.github.jacobwoodbury.centroidFinder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Stack;



public class DfsBinaryGroupFinder implements BinaryGroupFinder {
   /**
    * Finds connected pixel groups of 1s in an integer array representing a binary image.
    * 
    * The input is a non-empty rectangular 2D array containing only 1s and 0s.
    * If the array or any of its subarrays are null, a NullPointerException
    * is thrown. If the array is otherwise invalid, an IllegalArgumentException
    * is thrown.
    *
    * Pixels are considered connected vertically and horizontally, NOT diagonally.
    * The top-left cell of the array (row:0, column:0) is considered to be coordinate
    * (x:0, y:0). Y increases downward and X increases to the right. For example,
    * (row:4, column:7) corresponds to (x:7, y:4).
    *
    * The method returns a list of sorted groups. The group's size is the number 
    * of pixels in the group. The centroid of the group
    * is computed as the average of each of the pixel locations across each dimension.
    * For example, the x coordinate of the centroid is the sum of all the x
    * coordinates of the pixels in the group divided by the number of pixels in that group.
    * Similarly, the y coordinate of the centroid is the sum of all the y
    * coordinates of the pixels in the group divided by the number of pixels in that group.
    * The division should be done as INTEGER DIVISION.
    *
    * The groups are sorted in DESCENDING order according to Group's compareTo method.
    * 
    * @param image a rectangular 2D array containing only 1s and 0s
    * @return the found groups of connected pixels in descending order
    */
    @Override
    public List<Group> findConnectedGroups(int[][] image) {
        Map<String, Integer> map = new HashMap<>();

        List<Group> groupList = new ArrayList<>();

        for(int r = 0; r < image.length; r++){
            for(int c = 0; c < image[0].length; c++){

                if(image[r][c] == 1){
                    map.put("size", 0);
                    map.put("maxX", 0);
                    map.put("maxY", 0);
                   
                    dfsIterative(image, new Coordinate(c, r), map);

                    Coordinate centroid = new Coordinate(map.get("maxX")/map.get("size"), map.get("maxY")/map.get("size"));
                    Group island = new Group(map.get("size"), centroid);
                    groupList.add(island);

                }
            }
        }
        Collections.sort(groupList);
        Collections.reverse(groupList);
        return groupList;
    }
    
        /**
     * Performs an iterative DFS to find all connected pixels in a group.
     *
     * @param image The binary image array.
     * @param point The starting coordinate.
     * @param map   A map to accumulate group statistics (size, sum of X, sum of Y).
     */
        private void dfsIterative(int[][] image, Coordinate point, Map<String, Integer> map){
        int[][] directions = {{-1,0},{1,0},{0,-1},{0,1}};
        Stack<Coordinate> stack = new Stack<>();

        stack.push(point);
        while (!stack.isEmpty()) {
            Coordinate cur = stack.pop();
            int r = cur.y();
            int c = cur.x();

            if(image[r][c] != 1) continue;
            image[r][c] = 2;

            map.put("size", map.get("size")+1);
            map.put("maxX", map.get("maxX")+c);
            map.put("maxY", map.get("maxY")+r);

            for (int[] direction : directions) {
                int newR = r + direction[0];
                int newC = c + direction[1];
                if(newR >= 0 && newR < image.length && newC >= 0 && newC < image[0].length && image[newR][newC] == 1){
                    stack.push(new Coordinate(newC,newR));   
                }
            }
            
        }
        return;
    }
}
