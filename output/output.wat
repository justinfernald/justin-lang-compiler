(module
    (import "console" "log" (func $output (param i32)))
    (global $x i32)
    (func $minloc
        (param $a i32)
        (param $low i32)
        (param $high i32)
        (result i32)
        (local $i i32)(local $x i32)(local $k i32)
        (local.set $k
        )
        (local.set $x
        )
        (local.set $i
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
                )
                (local.set $k
                )
                )(else
            ))
            (local.set $i
            )
            br $loop_00001052010
        )))
        ;; returning
        return
    )(export "minloc" (func $minloc))

    (func $sort
        (param $a i32)
        (param $low i32)
        (param $high i32)
        
        (local $i i32)(local $k i32)(local $t i32)
        (local.set $i
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
            )
            (local.set $t
            )
            (local.set $a
            )
            (local.set $a
            )
            (local.set $i
            )
            br $loop_000105210
        )))
    )(export "sort" (func $sort))

    (func $main
        
        (local $i i32)
        (local.set $i
        )
        (loop $loop_00105200010
            (
                i32.lt_s
                (local.get $i)
                (i32.const 10)
            )
            (if (then
            (local.set $x
            )
            (local.set $i
            )
            br $loop_00105200010
        )))
        (local.set $i
        )
        (loop $loop_00105210
            (
                i32.lt_s
                (local.get $i)
                (i32.const 10)
            )
            (if (then
            (local.set $i
            )
            br $loop_00105210
        )))
    )(export "main" (func $main))

)
