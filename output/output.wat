(module
    (import "console" "log" (func $output (param i32)))
    (import "prompt" "alert" (func $input (result i32)))
    (global $x (mut i32) (i32.const 0))
    (func $minloc
        (param $a i32)
        (param $low i32)
        (param $high i32)
        (result i32)
        (local $i i32)(local $x i32)(local $k i32)
        (local.set $k
            (local.get $low)
        )
        (local.set $x
            (local.get $a)
        )
        (local.set $i
            (i32.add
                (local.get $low)
                (i32.const 1)
            )
        )
        (loop $loop_00001052010
            (
                i32.lt_s
                (local.get $i)
                (local.get $high)
            )
            (if (then
            ;; start if
                (
                    i32.lt_s
                    (local.get $a)
                    (local.get $x)
                )
                (if (then
                (local.set $x
                    (local.get $a)
                )
                (local.set $k
                    (local.get $i)
                )
                )(else
            ))
            (local.set $i
                (i32.add
                    (local.get $i)
                    (i32.const 1)
                )
            )
            br $loop_00001052010
        )))
        (return
            (local.get $k)
        )
    )(export "minloc" (func $minloc))

    (func $sort
        (param $a i32)
        (param $low i32)
        (param $high i32)
        
        (local $i i32)(local $k i32)(local $t i32)
        (local.set $i
            (local.get $low)
        )
        (loop $loop_000105210
            (
                i32.lt_s
                (local.get $i)
                (i32.sub
                    (local.get $high)
                    (i32.const 1)
                )
            )
            (if (then
            (local.set $k
                (call $minloc
                    (local.get $a)
                    (local.get $i)
                    (local.get $high)
                )
            )
            (local.set $t
                (local.get $a)
            )
            (local.set $a
                (local.get $a)
            )
            (local.set $a
                (local.get $t)
            )
            (local.set $i
                (i32.add
                    (local.get $i)
                    (i32.const 1)
                )
            )
            br $loop_000105210
        )))
    )(export "sort" (func $sort))

    (func $main
        
        (local $i i32)
        (local.set $i
            (i32.const 0)
        )
        (loop $loop_00105200010
            (
                i32.lt_s
                (local.get $i)
                (i32.const 10)
            )
            (if (then
            (global.set $x
                (call $input
                )
            )
            (local.set $i
                (i32.add
                    (local.get $i)
                    (i32.const 1)
                )
            )
            br $loop_00105200010
        )))
        (call $sort
            (global.get $x)
            (i32.const 0)
            (i32.const 10)
        )
        (local.set $i
            (i32.const 0)
        )
        (loop $loop_00105210
            (
                i32.lt_s
                (local.get $i)
                (i32.const 10)
            )
            (if (then
            (call $output
                (global.get $x)
            )
            (local.set $i
                (i32.add
                    (local.get $i)
                    (i32.const 1)
                )
            )
            br $loop_00105210
        )))
    )(export "main" (func $main))

)
