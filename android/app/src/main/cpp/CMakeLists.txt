cmake_minimum_required(VERSION 3.22.1)

project("mapboxassignment")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Disable Whisper examples/tests
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(WHISPER_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(WHISPER_BUILD_TESTS OFF CACHE BOOL "" FORCE)

# Add whisper.cpp
add_subdirectory(whisper.cpp)

# Native library
add_library(
    native-lib
    SHARED
    native-lib.cpp
)

target_include_directories(native-lib PRIVATE
    whisper.cpp/include
)

target_link_libraries(
    native-lib
    whisper
    android
    log
)