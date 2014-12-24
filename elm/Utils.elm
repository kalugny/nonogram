module Utils where

import Array as A

indexedMap2d : (Int -> Int -> a -> b) -> A.Array (A.Array a) -> A.Array (A.Array b)
indexedMap2d f = A.indexedMap (\y r -> A.indexedMap (\x a -> f x y a) r)


set2d : (Int, Int) -> a -> A.Array (A.Array a) -> A.Array (A.Array a)
set2d (x, y) v = indexedMap2d 
                    (\i j w ->
                        if i == x && j == y 
                        then v
                        else w
                    )


get2d : (Int, Int) -> A.Array (A.Array a) -> Maybe a
get2d (x, y) a = 
    case A.get y a of
        Nothing -> Nothing
        Just r  -> A.get x r


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


transpose2dList : [[a]] -> [[a]]
transpose2dList rows = 
    case length (head rows) of
        0 -> []
        _ -> (map head rows) :: (transpose2dList (map tail rows))


transposeTable : A.Array (A.Array a) -> A.Array (A.Array a)
transposeTable t = 
    let
        rows = A.toList (A.map A.toList t)
    in
        A.fromList (map A.fromList <| transpose2dList rows)
