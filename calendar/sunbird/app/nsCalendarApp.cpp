/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2002
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Brian Ryner <bryner@brianryner.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#include "nsXULAppAPI.h"
#ifdef XP_WIN
#include <windows.h>
#include <stdlib.h>
#endif
#include "nsBuildID.h"
#include <string.h>

const int TMP_ARG_MAX=21;
static const nsXREAppData kAppData = {
  "Mozilla",
  "Sunbird",
  APP_VERSION,
  BUILD_ID,
  "Copyright (c) 2004 mozilla.org",
  PR_FALSE, // no profile migration
  PR_TRUE,
  PR_FALSE
};
  

int main(int argc, char* argv[])
{
  char* temparg[TMP_ARG_MAX+1];
  char **argPtr;
  int argCount;
  int i;
  bool found = false;
  for (i=0; i < argc; i++) {
    if (!strncmp("-calendar", argv[i], 9))
      found = true;
  }
  if (!found) {
    temparg[0] = argv[0];
    temparg[1] = "-calendar";
    for( i=1; i<argc && i<TMP_ARG_MAX-1; i++ ) {
       temparg[i+1]=argv[i];
    }
    //we still might lose some args. a check would be handy with big neon letters yelling at the user.
    temparg[i+1]=0;
    argPtr = temparg;
    argCount = argc + 1;
  } else {
    argPtr = argv;
    argCount = argc;
  }
  
  return xre_main(argCount, argPtr, &kAppData);
}

#if defined( XP_WIN ) && defined( WIN32 ) && !defined(__GNUC__)
// We need WinMain in order to not be a console app.  This function is
// unused if we are a console application.
int WINAPI WinMain( HINSTANCE, HINSTANCE, LPSTR args, int )
{
    // Do the real work.
    return main( __argc, __argv );
}
#endif
