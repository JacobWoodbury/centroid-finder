
## ImageSummaryApp: check args for correct args.
store args.
use filepath to grab image store it in BufferedImage 
parse color from the hex string and use EuclideanColorDistance and DistanceImageBinarizer 
change the image to a binary array turns to black and white
dfs search for white islands as groups
store the groups in a csv file

## ImageGroupFinder:

This finds all groups given and sorts the groups from largest to smallest, like the CSV that was shown to us in class.

## Group:

A Group class that holds the size of each pixel that meets the requirements of touching another similar pixel and keeps the size of that group for comparison. Centroid is the average of the coordinates of that group. Has overridden compareTo to help determine order

## DistanceImageBinarizer:

This looks at how different the pixels are and whether or not we can consider them to be similar enough to the reference color. If they are close, we can consider changing the value to white; if not, we change it to black.

## Coordinate:

class record that holds the x and y values. This represents its place in the 2d array or the pixel value.

## BinaryGroupFinder:

This is the method that takes in the 2d array of the image and returns a group of the highest to lowest islands of white pixels that are touching vertically or horizontally.

## Binarizing ImageGroupFinder: 
    uses binarizer and groupFinder. Accepts a bufferedImage, and uses the Image Binarizer to create a usable binary image of black and white. 
    Uses the group finder to locate the islands. 
    We return a descending sorted list of islands (connected white pixels).

## BinaryGroupFinder: (Interface) / DFSBinartGroupFinder (class)
	Receives an image as a 2d array which is already binarized.
	We need to use a dfs to find the groups and then find the centroid in each group.
	Sort the Groups in descending order so that the largest appear first. 
	Returns the list of groups

## EuclideanColorDistance:
	Accepts 2 colors, and uses a distance formula to see how far apart they are visually.
	Returns the distance as a double
