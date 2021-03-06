$(function(){
    /*
     * Header
     */
    $('header>h1').shellView()
                  .delay(500)
                  .type('demmy.jp', 200)
                  .delay(5000)
                  .stopBlink(false);

    /*
     * Hakoniwa
     */
    var $hakoniwa = $('#hakoniwa>pre');
    var activateShell = function(e){
        $hakoniwa.addClass('active');
        e.stopPropagation();
    };
    var deactivateShell = function(){
        $hakoniwa.removeClass('active');
    };
    $hakoniwa.shellView();
    if('ontouchstart' in window){
        $hakoniwa.bind('touchstart', activateShell);
        $hakoniwa.children().bind('touchstart', activateShell);
        $(window).bind('touchstart', deactivateShell);
    } else{
        $hakoniwa.click(activateShell);
        $hakoniwa.children().click(activateShell);
        $(window).click(deactivateShell);
    }
    demmyjp.auto($hakoniwa, function($shell){
        return !$shell.hasClass('active');
    });

    /*
     * Keyboard
     */
    var $key = $('.key.alphabet');
    var typeKey = function(e){
        $hakoniwa.addClass('active');
        var $target = $(e.target);
        if(typeof($target.attr('data-shell-view-key')) == 'undefined'){
            $target = $target.parent();
        }
        demmyjp.input($hakoniwa, $target.attr('data-shell-view-key'));
        e.stopPropagation();
    };
    if('ontouchstart' in window){
        $key.bind('touchstart', typeKey);
        $key.children().bind('touchstart', typeKey);
    } else{
        $key.click(typeKey);
        $key.children().click(typeKey);
    }
});

(function(window, namespace, undefined){
'use strict'
    var ns = window[namespace];
    if(!ns){
        ns = {};
        window[namespace] = ns;
    }

    ns.length = function(source){
        var len = source.length;
        for(var i = 0; i < source.length; i++){
            if(source[i] != ' '){
                len += source[i].length;
            }
        }
        return len;
    };

    var codes = new Array();

    ns.c = codes.push({
        file: 'hello.c',
        source: [
            '#include <stdio.h>',
            ' ',
            'int main(int argc, char *argv[]){',
            '    puts("Hello, World!");',
            '    return 0;',
            '}'
        ],
        compile: 'gcc -o hello hello.c',
        run: './hello',
        result: 'Hello, World!'
    });

    ns.java = codes.push({
        before: function($shell){
            $shell.delay(500)
                  .interrupt(ns.handover)
                  .type('mkdir -p jp/demmy')
                  .prompt()
                  .interrupt(ns.handover);
        },
        file: 'jp/demmy/Hello.java',
        source: [
            'package jp.demmy;',
            ' ',
            'class Hello{',
            '    public static void main(String[] args){',
            '        System.out.println("Hello, World!");',
            '    }',
            '}'
        ],
        compile: 'javac jp/demmy/Hello.java',
        run: 'java jp/demmy/Hello',
        result: 'Hello, World!'
    });

    ns.run = function($shell, code){
        if(typeof(code.before) == 'function'){
            code.before($shell);
        }
        $shell.delay(500)
              .interrupt(ns.handover)
              .type('ed -p @')
              .prompt('@')
              .interrupt(ns.handoverFromEd)
              .delay(500)
              .interrupt(ns.handoverFromEd)
              .print('i')
              .newLine()
              .interrupt(ns.handoverFromEdEditing)
              .delay(500)
              .interrupt(ns.handoverFromEdEditing);
        for(var i = 0; i < code.source.length; i++){
            $shell.type(code.source[i]).newLine()
                  .interrupt(ns.handoverFromEdEditing);
        }
        $shell.type('.')
              .prompt()
              .interrupt(ns.handoverFromEd)
              .delay(500)
              .interrupt(ns.handoverFromEd)
              .type('wq ' + code.file)
              .newLine()
              .print(String(ns.length(code.source)))
              .prompt($shell.defaultPrompt)
              .interrupt(ns.handover);
        if(typeof(code.compile) != 'undefined'){
            $shell.delay(500)
                  .interrupt(ns.handover)
                  .type(code.compile)
                  .delay(500)
                  .prompt()
                  .interrupt(ns.handover);
        }
        $shell.delay(500)
              .interrupt(ns.handover)
              .type(code.run)
              .newLine()
              .print(code.result)
              .prompt()
              .interrupt(ns.handover);
    };

    var inputted = '';
    ns.auto = function($shell, condition){
        var r;
        var show = function(){
            r = Math.floor(Math.random() * codes.length);
            if(inputted){
                $shell.newLine()
                      .print(inputted + ': command not found')
                      .prompt();
                inputted = '';
            }
            ns.run($shell, codes[r]);
        };
        window.setInterval(function(){
            var queue = $shell.queue();
            if(typeof(condition) == 'function' && !condition($shell)){
                return;
            }
            if(typeof(queue) != 'undefined' && queue.length == 0){
                show();
            }
        }, 2000);
    };

    ns.handover = function($shell, callback){
        if($shell.hasClass('active')){
            $shell.clearQueue();
            if(typeof(callback) == 'function'){
                callback();
            }
        }
    };
    ns.handoverFromEd = function($shell){
        ns.handover($shell, function(){
            $shell.type('Q')
                  .prompt();
        });
    };
    ns.handoverFromEdEditing = function($shell){
        ns.handover($shell, function(){
            $shell.type('.')
                  .newLine()
                  .print('@')
                  .delay(500)
                  .type('Q')
                  .prompt();
        });
    };

    var inputQueue = '';
    ns.input = function($shell, command){
        inputQueue += command;
        var timer = window.setInterval(function(){
            var queue = $shell.queue();
            if(typeof(queue) != 'undefined' && queue.length == 0){
                window.clearInterval(timer);
                $shell.print(inputQueue);
                inputted += inputQueue;
                inputQueue = '';
            }
        }, 500);
    };

}(this, 'demmyjp'));
