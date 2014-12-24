import Window
import Array as A
import Graphics.Input (Input, input, clickable, Handle)
import Json
import Dict
import Http
import Debug (log)


cellSize = 48


data Cell = Unmarked | Empty | Filled 

data CellClick = New String 
               | Position (Int, Int)

type Table = A.Array (A.Array Cell)
type Row = A.Array Cell

data Puzzle a = NotLoaded | PuzzleRecord (PuzzleRecordInterface a)

type PuzzleRecordInterface a = { a |
  rows: [[Int]],
  cols: [[Int]],
  table: Table
}

createPuzzle : Int -> Int -> [[Int]] -> [[Int]] -> Puzzle {}
createPuzzle w h rows cols = PuzzleRecord { table = createTable h w,
                                            rows = rows,
                                            cols = cols }

--puzzle : Puzzle {}
puzzle_json = """{
          "rows":[
            [1, 1],
            [1],
            [1, 1],
            [1],
            [1, 1]
          ],
          "cols":[
            [1, 1, 1],
            [1, 1],
            [1, 1, 1]
          ],
          "width":3,
          "height":5
        }"""


cellClicks : Input CellClick
cellClicks = input (New "")


createTable : Int -> Int -> Table
createTable n m = A.repeat n <| A.repeat m Unmarked


printCell : Cell -> String
printCell c = case c of
                Unmarked -> " "
                Filled -> "*"
                Empty -> "x"


printRow : Row -> String
printRow r = join "|" <| A.toList <| A.map printCell r


printTable : Table -> String
printTable t = join "\n" <| A.toList <| A.map printRow t


cellShape : Cell -> Form
cellShape c = case c of
                Empty -> filled white (square cellSize)
                Filled -> filled black (square cellSize)
                Unmarked -> filled gray (square cellSize)


drawCell : Int -> Int -> Cell -> Element
drawCell y x c = clickable cellClicks.handle (Position (x, y)) <|
                 color black <|
                 container (cellSize + 2) (cellSize + 2) middle <|
                 collage cellSize cellSize <|
                 [cellShape c]


drawRow : Int -> Row -> Element
drawRow y r = flow right <|
              A.toList <| A.indexedMap (drawCell y) r


drawTable : Int -> PuzzleRecordInterface {} -> Element
drawTable w p = let tableElem = drawTableInternal p in
                container w (heightOf tableElem) middle tableElem


drawTableInternal : PuzzleRecordInterface {} -> Element
drawTableInternal p = flow left [
                        flow down (
                          (drawTopRow p) ::
                          (A.toList <| A.indexedMap drawRow p.table)
                        ),
                        flow down [
                          spacer 1  (numbersSize p.cols),
                          drawLeftCol p
                        ]
                      ]


numbersSize : [[Int]] -> Int
numbersSize a = (maximum (map length a) * (div cellSize 2))


tableToList : Table -> [[Cell]]
tableToList = A.toList . (A.map A.toList)


cols : [[Cell]] -> [[Cell]]
cols rows = case length (head rows) of
    0 -> []
    _ -> (map head rows) :: (cols (map tail rows))


drawTopRow : PuzzleRecordInterface {} -> Element
drawTopRow p =  flow right <|
                map ((container (2 + cellSize) (numbersSize p.cols) midBottom) .
                      (flow down) .
                      (map (container cellSize (div cellSize 2) middle) .
                          formatList)) <|
                zip (colMarkings p.table) p.cols


rowMarkings : Table -> [[Int]]
rowMarkings = A.toList . (A.map sumRow)


colMarkings : Table -> [[Int]]
colMarkings = (map (sumRow . A.fromList)) . 
              cols .
              tableToList


formatList : ([Int], [Int]) -> [Element]
formatList (current, expected) = 
      if current == expected
      then map (centered . (Text.color gray) . toText . show) expected
      else map (centered . toText . show) expected


drawLeftCol : PuzzleRecordInterface {} -> Element
drawLeftCol p = flow down <|
                map ((container (numbersSize p.rows) (cellSize + 2) midRight) .
                  (flow right) . 
                  (map (container (div cellSize 2) cellSize middle) . 
                  formatList)) <|
                zip (rowMarkings p.table) p.rows


indexedMap2d : (Int -> Int -> a -> b) -> A.Array (A.Array a) -> A.Array (A.Array b)
indexedMap2d f = A.indexedMap (\y r -> A.indexedMap (\x a -> f x y a) r)


getCell : Int -> Int -> Table -> Maybe Cell
getCell x y t = case A.get y t of
    Nothing -> Nothing
    Just r -> A.get x r


markCell : Cell -> Cell
markCell c = case c of
    Unmarked -> Filled
    Empty -> Unmarked
    Filled -> Empty


clickTable : Int -> Int -> Table -> Table
clickTable x y t = indexedMap2d 
                   (\i j c ->
                     if i == x && j == y 
                     then case getCell x y t of
                         Nothing -> c
                         Just foundCell -> markCell foundCell
                     else c) t 
 

takeWhile : (a -> Bool) -> [a] -> [a]
takeWhile cond xs = case xs of
            []  -> []
            _   -> if cond (head xs)
                   then (head xs) :: takeWhile cond (tail xs)
                   else []


dropWhile : (a -> Bool) -> [a] -> [a]
dropWhile cond xs = case xs of
            []  -> []
            _   -> if cond (head xs)
                   then dropWhile cond (tail xs)
                   else xs

groupBy : (a -> Bool) -> [a] -> [[a]]
groupBy cond xs = case xs of
        [] -> []
        _  -> let rest = dropWhile (not . cond) xs
              in case rest of
                [] -> []
                _  -> takeWhile cond rest :: (groupBy cond (dropWhile cond rest))


sumRow : Row -> [Int]
sumRow = (map length) . (groupBy ((==) Filled)) . A.toList


isCompleted : PuzzleRecordInterface {} -> Bool
isCompleted p = rowMarkings p.table == p.rows &&
                colMarkings p.table == p.cols

winningMessage : Int -> Element
winningMessage w = container w 40 middle <|
                   Text.centered <| 
                   Text.height 40 <| 
                   toText "Puzzle Completed!"


display : (Int, Int) -> Puzzle {} -> Element
display (w, h) puzzle = case puzzle of 
    NotLoaded -> plainText "Loading puzzle..."
    PuzzleRecord p ->
                    container w h midTop <| 
                    flow down <|
                      (drawTable w p) ::
                      if isCompleted p
                      then [winningMessage w]
                      else []


step : CellClick -> Puzzle {} -> Puzzle {}
step c puzzle = 
        case c of
          New json -> readPuzzle json
          Position (x, y) -> case puzzle of
            PuzzleRecord p -> 
                if not (isCompleted p) then
                   PuzzleRecord { p | table <- clickTable x y p.table }
                else puzzle
             

getNestedArray : [Json.Value] -> [[Int]]
getNestedArray = map (\(Json.Array b) ->
                          map (\(Json.Number n) -> 
                            round n) 
                          b)


readPuzzle : String -> Puzzle {}
readPuzzle j = case Json.fromString j of    
    Just (Json.Object d) -> createPuzzle 
              (case Dict.get "width" d of
                  Just (Json.Number n) -> round n
                  _ -> 1)
              (case Dict.get "height" d of
                  Just (Json.Number n) -> round n
                  _ -> 1)
              (case Dict.get "rows" d of
                  Just (Json.Array a) -> getNestedArray a
                  _ -> [[1]])
              (case Dict.get "cols" d of
                  Just (Json.Array a) -> getNestedArray a
                  _ -> [[1]])
    _ -> NotLoaded


loadNewPuzzle : String -> CellClick
loadNewPuzzle json = New json


getJsonRequest : String -> Signal String
getJsonRequest url =  lift 
        (\response -> case response of
            Http.Success json -> json
            _ -> "")
        (constant url |> Http.sendGet)


start = getJsonRequest "/3.json"


main : Signal Element
main = display <~ Window.dimensions ~ foldp step NotLoaded (merge (loadNewPuzzle <~ start) cellClicks.signal)
          