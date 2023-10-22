

set -ex



mamba --help
python -c "import mamba._version; assert mamba._version.__version__ == '1.4.2'"
test -f ${PREFIX}/condabin/mamba
exit 0
