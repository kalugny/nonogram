module Game where

import Board (..)
import Location (..)
import Mouse
import Consts (..)
import Array as A
import Debug (log)

game = { board = empty 5 5 }

clickSignal = sampleOn Mouse.clicks Mouse.position

clicks = foldp (::) [] clickSignal

change : Board -> Location -> [Location] -> Element
change b mp cp = asElement <| moveHighlight mp <| 
                 foldl (\c brd -> clearFog c brd) b cp

main = (change game.board) <~ Mouse.position ~ clicks