module Error (raise, assert)
       where

{-| Terminate a program with an error message.

# Error
@docs raise, assert

-}

import Native.Error

{-| Terminate a program and log an error message to the console.
Useful for debugging to indicate when internal assumptions have been violated.

For instance if at some point in your program a function expects a list to be non-empty but its input type is a list, you can indicate that it is a bug for the input to be empty:

```haskell
import Error

fun_that_expects_non_empty_list : [a] -> b
fun_that_expects_non_empty_list xs = case xs of
  [] -> Error.raise "Error: There is a bug in this program, please raise an issue on the GitHub page: https://github.com/.../.../issues"
  xs -> ...
```
-}
raise : String -> a
raise = Native.Error.raise

{-| Conditionally raise an error.
```haskell
Error.assert True "I don't get called" (\_ -> 3) == 3

Error.assert False "I do get called"  (\_ -> 3) == Error.raise "I do get called"
```
-}
assert : Bool -> String -> (() -> a) -> a
assert b err t = if b
                 then t ()
                 else raise err
