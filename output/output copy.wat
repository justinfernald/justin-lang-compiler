(module
    (import "console" "log" (func $output (param i32)))
    (import "window" "prompt" (func $input (result i32)))
    (memory (import "js" "mem") 1)
    (global $mem_pointer (mut i32) (i32.const 132))
    (global $hello (mut i32) (i32.const 0))
    (global $anotherOne (mut i32) (i32.const 12))
    (global $bruh (mut i32) (i32.const 0))
    (func $fib
        (param $n i32)
        (result i32)
        (local $function_output i32)(local $nums i32)
        (block $function_block
        (i32.store (global.get $hello) (i32.const 420))
        (i32.store (i32.add (global.get $hello) (i32.const 4)) (i32.const 57))
        (call $output
            (i32.load (global.get $hello))
        )
        (call $output
            (i32.load (i32.add (global.get $hello) (i32.const 4)))
        )

        (local.set $nums
            (i32.const 0)
            (i32.const 10)
        )
        (if
            (
                i32.eq
                (local.get $nums)
                    (i32.const 0)
                (i32.const 0)
            )
            (then
            (local.set $function_output 
                (i32.sub (i32.const 0)
                    (i32.const 1)
                )
            )(br $function_block)
        ))
        (if
            (
                i32.eq
                (local.get $n)
                (i32.const 0)
            )
            (then
            (local.set $function_output 
                (i32.const 0)
            )(br $function_block)
        ))
        (if
            (
                i32.eq
                (local.get $n)
                (i32.const 1)
            )
            (then
            (local.set $function_output 
                (i32.const 1)
            )(br $function_block)
        ))
        (local.set $function_output 
            (i32.add
                (call $fib
                    (i32.sub
                        (local.get $n)
                        (i32.const 1)
                    )
                )
                (call $fib
                    (i32.sub
                        (local.get $n)
                        (i32.const 2)
                    )
                )
            )
        )(br $function_block)
        )
        (return (local.get $function_output))
    )(export "fib" (func $fib))

    (func $listNums
        
        (local $function_output i32)(local $n i32)(local $i i32)
        (block $function_block
        (local.set $n
            (call $input
            )
        )
        (local.set $i
            (i32.const 0)
        )
        (block $block_000105210 (loop $loop_000105210
            (if
            (
                i32.lt_s
                (local.get $i)
                (local.get $n)
            )
            (then
            (call $output
                (local.get $i)
            )
            (local.set $i
                (i32.add
                    (local.get $i)
                    (i32.const 1)
                )
            )
            br $loop_000105210
        ))))
        )
        
    )(export "listNums" (func $listNums))

    (func $main
        (result i32)
        (local $function_output i32)(local $n i32)(local $val i32)
        (block $function_block
        (local.set $n
            (call $input
            )
        )
        (local.set $val
            (call $fib
                (local.get $n)
            )
        )
        (call $output
            (local.get $n)
        )
        (call $output
            (local.get $val)
        )
        (call $listNums
        )
        (local.set $function_output 
            (local.get $val)
        )(br $function_block)
        )
        (return (local.get $function_output))
    )(export "main" (func $main))

)
