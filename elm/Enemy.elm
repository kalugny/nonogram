module Enemy where

import Location (..)
import Consts (..)
import Table (..)
import Array as A

-- Model

type Enemy = { 
    location: (Float, Float)
}

data Route = [Location]


isRoute : Cell -> Table -> Route -> Bool
isRoute c t r =
    case A.length t of
        0   -> False
        1   -> any <| map (((==) Just c) . (\l -> get2d l t)) r


findRoutes : Cell -> Table -> [Route]


-- Controller


-- View

asForm : Enemy -> Form
asForm enemy =  move enemy.location <|
                filled red <|
                circle <| cell_size / 3