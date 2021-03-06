# Author: LiXizhi	
# Company: ParaEngine.com
# Date: 2014.1.25
# Desc: Sample C++ ParaEngine Plugin
# Note: 
# NPLRUNTIME_ROOT: set a user environment variable to point to the git root directory of NPLRuntime. 
#  or you can run [ParacraftSDK]/NPLRuntime/install_src.bat to download or clone NPLRuntime source code from github. 
# Set BOOST_ROOT env variable to point to your boost install directory. Run CMake in any folder other than the src folder and build. 

cmake_minimum_required(VERSION 2.6)

project (QiNiuPlugin)

# add the binary tree to the search path for include files
include_directories("${PROJECT_SOURCE_DIR}")
# Note: include the ParaEngine/NPLRuntime include directory
if ("$ENV{NPLRUNTIME_ROOT}" STREQUAL "")
	set(NPLRUNTIME_ROOT ${PROJECT_SOURCE_DIR}/../../../NPLRuntime/src/NPLRuntime/Client/trunk/ParaEngineClient)
else()
	set(NPLRUNTIME_ROOT $ENV{NPLRUNTIME_ROOT}/Client/trunk/ParaEngineClient)
endif()
include_directories("${NPLRUNTIME_ROOT}/Core")

link_directories("${PROJECT_SOURCE_DIR}/qiniu/lib")

# include boost
if ("$ENV{BOOST_ROOT}" STREQUAL "")
	set(BOOST_ROOT ${PROJECT_SOURCE_DIR}/../boost_1_55_0)
endif()
if( CMAKE_SIZEOF_VOID_P EQUAL 8 )
	set(BOOST_LIBRARYDIR ${BOOST_ROOT}/stage/lib64)
else()
	set(BOOST_LIBRARYDIR ${BOOST_ROOT}/stage/lib32)
endif()

set(Boost_USE_MULTITHREADED ON)
set(Boost_USE_STATIC_LIBS   ON)
set(Boost_USE_STATIC_RUNTIME ON)

# Here are some examples of using boost 
find_package( Boost 1.55) 
# Add more boost components here
# find_package( Boost 1.55 REQUIRED COMPONENTS thread date_time filesystem system chrono signals serialization iostreams regex) 

SET(QiNiuPlugin_SRCS
	stdafx.cpp
	QiNiu.cpp
	QiNiuPlugin.cpp
)

IF(MSVC)
	# statically link MSVC to reduce dependancies
	foreach(flag_var CMAKE_CXX_FLAGS CMAKE_CXX_FLAGS_DEBUG CMAKE_CXX_FLAGS_RELEASE CMAKE_CXX_FLAGS_MINSIZEREL CMAKE_CXX_FLAGS_RELWITHDEBINFO CMAKE_C_FLAGS CMAKE_C_FLAGS_DEBUG CMAKE_C_FLAGS_RELEASE CMAKE_C_FLAGS_MINSIZEREL CMAKE_C_FLAGS_RELWITHDEBINFO)
	 	if(${flag_var} MATCHES "/MD")
			string(REGEX REPLACE "/MD" "/MT" ${flag_var} "${${flag_var}}")
	 	endif(${flag_var} MATCHES "/MD")
	 	if(${flag_var} MATCHES "/MDd")
	 		string(REGEX REPLACE "/MDd" "/MTd" ${flag_var} "${${flag_var}}")
		endif(${flag_var} MATCHES "/MDd")
	endforeach(flag_var)
	
	# /GR- Remove RTTI to miminize the executable size
	SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /GR-")
	SET(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} /Zi")
ENDIF()


IF(MSVC)
	# generate program database (PDB symbol files even in release build)
	SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /Zi")
	SET(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} /Zi")
ENDIF(MSVC)


SET(CMAKE_DEBUG_POSTFIX "_d")

include_directories("${Boost_INCLUDE_DIRS}")
ADD_DEFINITIONS(-DBOOST_SIGNALS_NO_DEPRECATION_WARNING)

# add the executable
add_library(QiNiuPlugin SHARED ${QiNiuPlugin_SRCS} ${Boost_LIBRARIES})
target_link_libraries(QiNiuPlugin qiniu)


if(MSVC)
	get_target_property(DEBUG_EXE_PATH OCCPlugin DEBUG_LOCATION)
	STRING(REGEX REPLACE "^.*[/\\]([^/\\]+)$" "\\1" DEBUG_EXE_NAME "${DEBUG_EXE_PATH}" )

	get_target_property(RELEASE_EXE_PATH PhysicsBT RELEASE_LOCATION)
	STRING(REGEX REPLACE "^.*[/\\]([^/\\]+)$" "\\1" RELEASE_EXE_NAME "${RELEASE_EXE_PATH}" )

# Handy post build script, just in case you need it. 
#	ADD_CUSTOM_COMMAND(
#	   TARGET QiNiuPlugin
#	   POST_BUILD
#	   COMMAND ${CMAKE_COMMAND} -E copy ${DEBUG_EXE_PATH} ${CLIENT_SOURCE_DIR}/../../ParaWorld/${DEBUG_EXE_NAME}
#	   COMMAND ${CMAKE_COMMAND} -E copy ${RELEASE_EXE_PATH} ${CLIENT_SOURCE_DIR}/../../ParaWorld/${RELEASE_EXE_NAME}
#	)

endif(MSVC)
