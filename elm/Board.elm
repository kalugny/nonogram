module Board where

import Array as A
import Enemy (Enemy)
import Enemy
import Location (..)
import Consts (..)
import Utils (..)
import Table (..)

import Debug (log)

-- Model

type Board = {
    theMap: Table,
    fog: Table,
    highlightedCell: Location,
    enemies: [Enemy]
}


empty : Int -> Int -> Board
empty w h = { theMap = A.fromList <| [
                A.fromList [Map Road, Map Road, Map Empty, Map Empty, Map Road],
                A.fromList [Map Road, Map Empty, Map Empty, Map Empty, Map Road],
                A.fromList [Map Road, Map Empty, Map Empty, Map Empty, Map Empty],
                A.fromList [Map Road, Map Empty, Map Empty, Map Road, Map Road],
                A.fromList [Map Road, Map Road, Map Empty, Map Empty, Map Road]
              ],
              fog = fullFog w h, 
              highlightedCell = (0, 0),
              enemies = []
            }


width : Board -> Int
width b =   maximum <|
            A.toList <|
            A.map
                (\r -> A.length r + (length . (sumRow (Map Road))) r)
                b.theMap


height : Board -> Int
height b =  A.length b.theMap + 
            (   maximum <| 
                A.toList <|
                A.map 
                    (length . (sumRow (Map Road))) 
                    (transposeTable b.theMap)
            )


seenMap : Board -> Table
seenMap b = indexedMap2d 
                (\x y e -> 
                    case get2d (x, y) b.fog of
                        Just (Fog Revealed) -> e
                        _                   -> Map Empty
                )
                b.theMap

-- Controller

screenToGrid : Location -> Location
screenToGrid (x, y) =
        (floor ((toFloat x) / cell_size),
         floor ((toFloat y) / cell_size))


gridToBoard : Board -> Location -> Location
gridToBoard b (x, y) =
    let
        leftNumbersWidth = longestRowSize <| rowNumbers b.theMap
        topNumbersHeight = longestRowSize <| rowNumbers <| transposeTable b.theMap
    in
        (x - leftNumbersWidth, y - topNumbersHeight)


moveHighlight : Location -> Board -> Board
moveHighlight l b = {b | highlightedCell <- screenToGrid l}


clearFog : Location -> Board -> Board
clearFog l b = 
    let
        newL = gridToBoard b <| screenToGrid l
    in
        { b | fog <- set2d newL (Fog Revealed) b.fog}


-- View


drawHighlight : Location -> Form
drawHighlight (x, y) = 
    let
        fx = (toFloat x + 0.5) * cell_size
        fy = -(toFloat y + 0.5) * cell_size
    in
        move (fx, fy) <|
        outlined (dashed black) <|
        rect cell_size cell_size


drawBoardWithNumbers : Board -> Form
drawBoardWithNumbers b =
    let
        foggedMap = group [drawTable b.theMap, drawTable b.fog]        
        leftNumbers = drawNumbers Row b.theMap
        topNumbers = drawNumbers Column b.theMap
        leftNumbersWidth = toFloat (longestRowSize <| rowNumbers b.theMap)  * cell_size
        topNumbersHeight = toFloat (longestRowSize <| rowNumbers <| transposeTable b.theMap) * cell_size
    in
        group [
            moveY -topNumbersHeight leftNumbers,
            moveX leftNumbersWidth topNumbers,
            move (leftNumbersWidth, -topNumbersHeight) foggedMap
        ]


asElement : Board -> Element
asElement b = 
    let 
        bwidth  = (floor cell_size) * (width b)
        bheight = (floor cell_size) * (height b)
        collageOffset = (((toFloat -bwidth) / 2), ((toFloat bheight) / 2))
    in
        collage bwidth bheight <|
            map (move collageOffset) <|
                [drawBoardWithNumbers b,
                 drawHighlight b.highlightedCell] ++ 
                (map Enemy.asForm b.enemies)
