$Env:CONDA_EXE = "/Users/astridz/Documents/AI_recipe/no/bin/conda"
$Env:_CE_M = ""
$Env:_CE_CONDA = ""
$Env:_CONDA_ROOT = "/Users/astridz/Documents/AI_recipe/no"
$Env:_CONDA_EXE = "/Users/astridz/Documents/AI_recipe/no/bin/conda"
$CondaModuleArgs = @{ChangePs1 = $True}
Import-Module "$Env:_CONDA_ROOT\shell\condabin\Conda.psm1" -ArgumentList $CondaModuleArgs

Remove-Variable CondaModuleArgs