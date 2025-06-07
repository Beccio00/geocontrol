# Project Estimation part 2



Goal of this document is to compare actual effort and size of the project, vs the estimates made in task1.

## Computation of size

To compute the lines of code use cloc    
To install cloc:  
           `npm install -g cloc`   
On Windows, also a perl interpreter needs to be installed. You find it here https://strawberryperl.com/  
To run cloc  
           `cloc <directory containing ts files> --include-lang=TypeScript`  
As a result of cloc collect the *code* value (rightmost column of the result table)  
        

Compute two separate values of size  
-LOC of production code     `cloc <Geocontrol\src> --include-lang=TypeScript`  
-LOC of test code      `cloc <GeoControl\test> --include-lang=TypeScript`  


## Computation of effort 
From timesheet.md sum all effort spent, in **ALL** activities (task1, task2, task3) at the end of the project on June 7. Exclude task4

## Computation of productivity

productivity = ((LOC of production code)+ (LOC of test code)) / effort  = (2287+9253)/287=40,209


## Comparison

|                                        | Estimated (end of task 1) | Actual (june 7, end of task 3)|
| -------------------------------------------------------------------------------- | -------- |----|
| production code size | 2220 LoC |2287 LoC|    
| test code size | unknown |9253 LoC|           
| total size  |unknown + 2220 LoC| 11540 LoC|                      
| effort |230 h|287 h|                            
| productivity  | 10 loc / hour |40,21 loc / hour|      

