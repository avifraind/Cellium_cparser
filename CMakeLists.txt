cmake_minimum_required(VERSION 3.15)
project(Cellium_cparser C)

set(CMAKE_C_STANDARD 99)

add_executable(Cellium_cparser main.c cJSON.c cJSON.h cJSON_Utils.c cJSON_Utils.h nxjson.c nxjson.h)