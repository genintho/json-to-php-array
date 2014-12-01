var JSONtoArray = ( function(){
    var inputForm  = null;
    var outputForm = null;

    // Helper function, based on the settings
    var tabulation = null;
    var openArray  = null;
    var closeArray = null

    function bindEvent(){
        document.getElementById( 'form' ).addEventListener( 'submit', function( event ){
            event.preventDefault();
            formSubmit();
        });

        // Pasting stuff will trigger a submit
        document.addEventListener( 'paste', function( event ){
            event.preventDefault();
            // Make sure we are pasting text
            if( event.clipboardData.types.indexOf( 'text/plain' ) === -1 &&
                event.clipboardData.types.indexOf( 'application/json' ) === -1
            ){
                return;
            }
            inputForm.value = event.clipboardData.getData( 'Text' );
            document.getElementById( 'go' ).click();
        });
    }

    function formSubmit(){
        var json = null;

        try{
            json = JSON.parse( inputForm.value.trim() );
        }
        catch( err ){
            console.error( 'Error while trying to parse the json', err );
            outputForm.value = "Error while parsing JSON. Open JavaScript console for more information\n\n" + err;
            return;
        }

        try{
            run( json );
        }
        catch ( err ){
            console.error( 'Error while converting JSON', err );
            alert( "Error while trying to convert the JSON. Open JavaScript console for more information" );
            return;
        }
    }

    /**
     * Main runner
     * @param {Object} json
     */
    function run( json ){
        console.log( 'Input JSON', json );

        // Generate the closure, based on the settings
        tabulation = tabGenerator();
        openArray  = openArrayGenerator();
        closeArray = closeArrayGenerator();

        var html = "$json = ";
        html    += formatObject( json, 1 );
        html    += ";\n";

        outputForm.value = html;
    }

    /**
     * Generate the PHP representation of 1 object.
     *
     * @note !!! recursive!
     *
     * @param {Object} obj
     * @param {Number} level How deep are we? Use for tabulation
     * @returns {string}
     */
    function formatObject( obj, level ){
        var html = openArray() + "\n";

        for( var key in obj ){
            var value = obj[key];
            html += tabulation( level ) + '"' + key + '" => ';

            switch( typeof value ) {

                case "number":
                    html += String( value );
                    break;

                case "string":
                    html += '"' + value + '"';
                    break;

                case "object":
                    if( value instanceof Array ){
                        html += formatObject( value, level + 1 );
                    }
                    else if( value === null || value === undefined ){
                        html += "null";
                    }
                    else{
                        html += formatObject( value, level + 1 );
                    }
                    break;
            }
            html += ",\n";
        }
        html = html.substr( 0, html.length -2 ) + "\n";
        html += tabulation( level - 1 );
        return html  + closeArray();
    }

    /**
     * Generate a function that will inject the correct tabulation character based on the settings
     *
     * @returns {Function}
     */
    function tabGenerator(){
        var tabCharacter = document.getElementById( 'tabStyle' ).value;
        return function( nb ){
            var a = "";
            for( var i = 0; i < nb; i++ ){
                a += tabCharacter;
            }
            return a;
        };
    }

    /**
     * Generate a function to open a PHP array, with a different format, depending on the style chosen
     *
     * @returns {Function}
     */
    function openArrayGenerator(){
        var arrayType = document.getElementById( 'arrayStyle' ).value;
        return function(){
            return arrayType === '5.3' ? 'array(' : '[';
        };
    }

    /**
     * Generate a function to close a PHP array, with a different format, depending on the style chosen
     *
     * @returns {Function}
     */
    function closeArrayGenerator(){
        var arrayType = document.getElementById( 'arrayStyle' ).value;
        return function(){
            return arrayType === '5.3' ? ')' : ']';
        };
    }

    return function init(){
        inputForm  = document.getElementById( 'input' );
        outputForm = document.getElementById( 'output' );
        bindEvent();
    };
})();
