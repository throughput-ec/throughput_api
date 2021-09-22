#!/bin/bash
show_help() {
cat <<HELP
Usage: bash genoatt.sh [-ht]

Use the oatts npm module to build mocha tests for the package and optionally execute the test suite.

This bash script also performs some text replacement to account for issues in the oatts module:

Options:
    [none]      build the mocha tests and exit
    -h          display this help and exit
    -t          build the tests and run "npm test"

HELP
}

run_oatt() {

    oatts generate --host localhost:3000 -s ./throughput.yaml -w test
    eslint --fix ./test

}

 OPTIND=1
 # Resetting OPTIND is necessary if getopts was used previously in the script.
 # It is a good idea to make OPTIND local if you process options in a function.
 
test=0

 while getopts "ht" opt; do
     case $opt in
         h)
             show_help
             exit 0
             ;;
         t)
             test=1
             ;;
         *)
             echo You didn\'t use the correct flag.
             show_help
             exit 1
             ;;
     esac
 done

run_oatt

if [ $test -eq 1 ]; then
    echo Waiting for API to rebuild before tests \(3s\)
    sleep 3s
    npm test
    exit 0
fi

 shift "$((OPTIND-1))"   # Discard the options and sentinel --
 