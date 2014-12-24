module Table where

import Consts (..)
import Array as A
import Utils (..)
import Location (..)
import Graphics.Element as E

-- Model


data MapCell = Road | Empty | Tower

data FogCell = Hidden | Revealed

data Cell = Fog FogCell | Map MapCell
type Row = A.Array Cell
type Table = A.Array Row

data Direction = Row | Column


fullFog : Int -> Int -> Table
fullFog w h = A.repeat h <| A.fromList <| Fog Revealed :: (repeat (w-1) (Fog Hidden))


sumRow : Cell -> Row -> [Int]
sumRow filled r = 
    let 
        l = map length <| groupBy ((==) filled) <| A.toList r
    in
        case l of
            []  -> [0]
            _   -> l


longestRowSize : A.Array (A.Array a) -> Int
longestRowSize ns = maximum <| A.toList <| A.map (A.length) ns


rowNumbers : Table -> A.Array (A.Array Int)
rowNumbers = A.map (A.fromList . (sumRow (Map Road)))


-- View

numbers_style = defaultStyle

offsetCell = move (cell_size / 2, -cell_size / 2)


styleNumber : Int -> Form
styleNumber = offsetCell .
              toForm . 
              (container icell_size icell_size middle) .
              centered . 
              (style numbers_style) . 
              toText .
              show


drawNumbersRow : Direction -> Int -> A.Array Int -> Form
drawNumbersRow dir max_len nums =
    let
        margin = max_len - (A.length nums)
        moveFunc f = case dir of
            Row     -> moveX f
            Column  -> moveY -f
    in
        moveFunc (toFloat margin * cell_size) <|
        group <|
        A.toList <|
        A.indexedMap 
            (\i n ->
                moveFunc (toFloat i * cell_size) <| styleNumber n) nums


drawNumbers : Direction -> Table -> Form
drawNumbers dir tab = 
    let
        t = case dir of
            Row     -> tab
            Column  -> transposeTable tab
        numbers = rowNumbers t
        moveFunc f = case dir of
            Column  -> moveX f
            Row     -> moveY -f
    in
        group <|
        A.toList <|
        A.indexedMap (\i r ->
            moveFunc (toFloat i * cell_size) <|
            drawNumbersRow dir (longestRowSize numbers) r) numbers


drawCell : Cell -> Form
drawCell c = 
    offsetCell <|
    case c of
        Map m   ->  case m of
                        Road    ->  filled lightGreen <| rect cell_size cell_size
                        Empty   ->  filled darkCharcoal <| rect cell_size cell_size
                        Tower   ->  group [
                                        filled darkCharcoal <| rect cell_size cell_size,
                                        filled lightBlue <| ngon 6 <| cell_size / 2
                                    ]
        Fog f   ->  case f of
                        Hidden  -> filled lightGray <| rect cell_size cell_size
                        Revealed-> toForm E.empty


drawRow : Row -> Form
drawRow r = group <|
            A.toList <|
            A.indexedMap 
                (\i c -> moveX (toFloat i * cell_size) <| drawCell c)
                r   


drawTable : Table -> Form
drawTable = group .
            A.toList .
            (A.indexedMap (\i r -> moveY -(toFloat i * cell_size) <| drawRow r))

