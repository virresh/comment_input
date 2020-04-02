# Comment Input  

Send input to your single-file applications with ease!  
Just add a comment in your source with desired input and voila!  

Aimed at competitive programmers and Data Scientists who spend time debugging small (single file) scripts.

## Features

- Select a custom keyphrase  
- Supported for all languages that have a block comment and are supported by code-runner*  
- Uses VSCode's internal comment settings, no need for extra configuration  
- Plug and play. Should work out of the box
- Uses integrated terminal, so you don't have to switch tabs often

\* code-runner has some limitations and all those apply to this extension as well.

## Requirements
[code-runner](https://github.com/formulahendry/vscode-code-runner) is required for this extension to work since VSCode doesn't support hijacking terminal input.


## Extension Settings

Only setting is trigger keyphrase

* `cinp.trigger`: Set the keyword for comment identification. Default is "input".

-----------------------------------------------------------------------------------------------------------

## Usage

A sample script looking as follows:  
```python
"""input
4 "abc"
"""
i, j = input().split(" ")
print(int(i) + 100, j)
```

Similarly for c++:
```c++
#include <iostream>
using namespace std;
/*input
4 "abc"
*/
int main(){
    string s;
    cin>>s;
    cout<<s<<"\n";
}
```

will be executed with `4 "abc"` sent to stdin of the terminal. 

## Known Issues
VSCode doesn't provide an api to read the language settings yet. Thus, I've used a hack which is not guaranteed to work if your settings are saved in a different location.  
Issue Link: https://github.com/microsoft/vscode/issues/2871  

## Contributing
People are invited to help out with code / tests / documentation. Please send PRs / file issues on Github repository itself.

## FAQ
* Block comments not working in Python!  
  Please ensure that you are using the correct block comment character. Python supports multiline strings with both `"""` and `'''`. The one that is set to block comment character in VSCode's language settings is the one that is used. It defaults to `"""`.

### Acknowledgement
A [similar extension](https://packagecontrol.io/packages/Sublime%20Input) exists in sublime-text as well. 
