import Error

myHead : [a] -> a
myHead xs = case xs of
  []     -> Error.raise "Error: myHead expects an empty list"
  (x::_) -> x

main = flow down . map asText <|
       [ myHead [] 
       , myHead [1,2,3]
       ]
