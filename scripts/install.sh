#!/bin/bash

NODE_VERSION=8
REPO="rythmus"
REMOTE="https://github.com/chevalvert/$REPO.git"
DEST="$PWD/$REPO"

# test if command exists
ftest () {
  echo "Checking for ${1}..."
  if ! type -f "${1}" > /dev/null 2>&1; then
    return 1
  else
    return 0
  fi
}

# feature tests
features () {
  for f in "${@}"; do
    ftest "${f}" || {
      echo >&2 "error: Missing \`${f}'! Make sure it exists and try again."
      return 1
    }
  done
  return 0
}

# SEE https://gist.github.com/davejamesmiller/1965569
ask () {
  local prompt default reply

  if [ "${2:-}" = "Y" ]; then
    prompt="Y/n"
    default=Y
  elif [ "${2:-}" = "N" ]; then
    prompt="y/N"
    default=N
  else
    prompt="y/n"
    default=
  fi

  while true; do
    # Ask the question (not using "read -p" as it uses stderr not stdout)
    echo -n "$1 [$prompt] "

    # Read the answer (use /dev/tty in case stdin is redirected from somewhere else)
    read reply </dev/tty

    # Default?
    if [ -z "$reply" ]; then
      reply=$default
    fi

    # Check if the reply is valid
    case "$reply" in
      Y*|y*) return 0 ;;
      N*|n*) return 1 ;;
    esac
  done
}

# main setup
setup () {
  echo
  echo "This will install $REPO and all its dependencies."
  ask "Do you wish to continue ?" || return 1

  echo
  echo "Running $REPO installation..."
  echo

  # Fail if destination exists
  test -d "${DEST}" && {
    echo >&2 "warning: Already exists: '$DEST'"
    ask "Overwrite $DEST ?" || return 1
    rm -rf $DEST
    echo
  }

  # test for require features
  features git node npm || return $?

  # installation and build
  {
    echo
    echo "Cloning $REPO..."
    git clone --depth=1 "${REMOTE}" "${DEST}" || return $?
    rm -rf $DEST/.git

    echo
    echo "Installing $REPO..."
    (cd $DEST && npm link --only=production)

    echo
    if ! command $REPO -v  > /dev/null 2>&1; then
      echo >&2 "error: Something went wrong during installation, please try again or install manually."
      return 1
    else
      echo "$REPO v$(command $REPO -v) successfully installed !"
      echo
      echo "Visit ${REMOTE/.git/#readme} to read documentation or type '$REPO --help'"
    fi
  } >&2
  return $?
}

[ $# -eq 0 ] && setup
exit $?
