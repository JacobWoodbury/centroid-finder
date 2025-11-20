# Human Improvements

### Look to move to sqlite

- have an accessible database to store jobs and video information

### refactoring code

- What improvements can you make to the design/architecture of your code?
  - Add sqlite to have better persistent data
- How can you split up large methods or classes into smaller components?
  - Controller could be split to video function and job function
- Are there unused files/methods that can be removed?
  - Yes, comments mostly
- Where would additional Java interfaces be appropriate?
  - Processor could possibly use something
- How can you make things simpler, more-usable, and easier to maintain?
  - make sure functionality have their own class files keeping to OOP
- Other refactoring improvements?

### adding tests

- What portions of your code are untested / only lightly tested?
  - Routes in our server
- Where would be the highest priority places to add new tests?
  - Routes in our server
- Other testing improvements?

### improving error handling

- What parts of your code are brittle?
  - Some server controller components
- Where could you better be using exceptions?
- In server controller and videoSummaryApp
- Where can you better add input validation to check invalid input?
  - Server controller
- How can you better be resolving/logging/surfacing errors? Hint: almost any place you're using "throws Exception" or "catch(Exception e)" should likely be improved to specify the specific types of exceptions that might be thrown or caught.
  Other error handling improvements>
  - In server controller and videoSummaryApp there could be better error handling to better understand the issues appearing

### writing documentation

- What portions of your code are missing Javadoc/JSdoc for the methods/classes?
  - A lot of documentation is missing. Probably use AI to build docs for each undocumented class
- What documentation could be made clearer or improved?
  - server files
- Are there sections of dead code that are commented out?
  - Yes, we should clear that out
- Where would be the most important places to add documentation to make - your code easier to read?
  - server and new classes
- Other documentation improvements?

### Performance

- Optimize docker
