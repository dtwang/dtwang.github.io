

  // ********************************************************************
  //
  // Javascript for Viaduct_essential_lib
  // Author: Geoffrey Wang
  // v0.5 (2016/4/22)
  //
  // provide common and useful javascript function to kklabs html5 project

  // API List:
  //
  //  - getURLParameter
  //  - callNativeMethod
  //  - audioPlayByUrl
  //  - audioPlayChannel02isConnectedBLE
  //  - adjustImgFitInParent
  //  - makeId
  // 
  // resivion:
  //   v0.5:  improve audio playing event, using workaround for android 
  //   v0.4:  add more function and improve for audio player channel1
  //   v0.3:  improved callNativeMethod: prevent too short-time call
  //   v0.2:  NEW API: makeId;
  //   v0.1:  split from kk7common.js (porta project)
  //
  // ********************************************************************

  
  function viaductEssentail()
  {

      var myAudioChannel1;
      var myAudioChannel1playingCallback;
      var myAudioChannel1errCallback;
      var myAudioChannel1endedCallback;
      var myAudioChannel1timeupdateCallback;
      var myAudioChannel2=null;

      // API function: adjustImgFitInParent

      this.adjustImgFitInParent = function (name)
      { 

          var outterWidth=0;
          var otterHeight=0;

          if($(name).parent().parent().prop("tagName")=="BODY")
          {
            outterWidth = $(window).width();
            otterHeight = $(window).height();
          }
          else
          {
            outterWidth = $(name).parent().parent().width();
            otterHeight = $(name).parent().parent().height();
          }

          //console.log("adjustImgFitInParent()="+name);
          if($(name).width() > $(name).height())
          {
            // for landscape resource

            if(( outterWidth / otterHeight )>($(name).width()/$(name).height()))
            {
               
               $(name).css("width",outterWidth+"px");
               $(name).css("height","auto");
               $(name).parent().css("top","-"+ ($(name).height()-otterHeight)/2+"px");
               $(name).parent().css("left","0px");
            }
            else 
            {
               $(name).css("height",otterHeight+"px");
               $(name).css("width","auto");

               //console.log("outterWidth="+outterWidth);

               $(name).parent().css("left","-"+ ($(name).width()-outterWidth)/2+"px");
               $(name).parent().css("top","0px");
            }
          }
          else
          {
            // for portrait resource
            //console.log("start to adjust portrait resource:"+name+" img ratio="+($(name).height()/$(name).width())+" screen ratio="+(outterWidth/otterHeight));

            if( (otterHeight / outterWidth )>($(name).height()/$(name).width()))
            {  

             $(name).css("width","auto");
             $(name).css("height",otterHeight+"px");

             console.log("outterWidth="+outterWidth);
             
             $(name).parent().css("left","-"+ ($(name).width()-outterWidth )/2+"px");
             $(name).parent().css("top","0px");
            }
            else
            {
              
             $(name).css("width",outterWidth+"px");
             $(name).css("height","auto");
             $(name).parent().css("top","-"+ ($(name).height()-otterHeight )/2+"px");
             $(name).parent().css("left","0px");


            }
          }

          $(name).parent().css("height",$(name).height()+"px");
          $(name).parent().css("width",$(name).width()+"px");

      }
      // API function: this.getURLParameter
      this.getURLParameter =function (name) 
      {
        return decodeURI(
                  (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
              );
      };

      // API function: callNativeMethod, new mode: auto add interval delay
      var lastExecTS=0;
      var execQCounter=0;

      this.callNativeMethod =function (m)
      { 

            // console.log(m+" called");
            
            var currentExecTime = (new Date()).getTime();
            var autoAddingTimeOut=false;

            var isNativeMethodSupport= false;

            if(this.getURLParameter("simu")=="null" && ( navigator.userAgent.search('Android')!=-1 || navigator.userAgent.search('iPhone')!=-1 || navigator.userAgent.search('iPad')!=-1 ))
              isNativeMethodSupport=true;

            //console.log("currentExecTime="+currentExecTime);
            //console.log("lastExecTS="+lastExecTS);
            //console.log("execQCounter="+execQCounter);

            if( (currentExecTime - lastExecTS) < 80 )
            {
              autoAddingTimeOut=true; 
              execQCounter++;
              lastExecTS = currentExecTime+80;
            }
            else
            {
              execQCounter=0;
              lastExecTS=currentExecTime;
            }

            if(autoAddingTimeOut)
            {
              //console.log("exec with delay:"+m);
              setTimeout(function(){

                    // determine if mobile device webview
                    if( isNativeMethodSupport )
                    {

                      location.href="viaduct://"+m;
                    }
                    else
                    {
                      console.log("NativeMethod called:"+m)
                    }    
                },10*execQCounter);
            }
            else
            {

              // determine if mobile device webview
              if( isNativeMethodSupport )
              {

                location.href="viaduct://"+m;
              }
              else
              {
                console.log("NativeMethod called:"+m)
              }    

            }
      
      };

      // API section: audio: this.audioPlayByUrl (dynamic ) / audioPlayChannel02 (static)
  
      // API function: audioPlayByUrl

      var isPlayingCallbackTriggered=false;

      this.audioPlayByUrl = function (url, onplayfunction,onerrfunction, onendedfunction, ontimeupdatefunction)
      {
         this.audioStop();
         
         if(myAudioChannel1 == null)
         {
              //console.log("HTML5 audio: init myAudioChannel1");

              myAudioChannel1 = document.getElementById("audioChannel01");
              // canplay , canplaythrough


              myAudioChannel1.addEventListener('canplay', 
                function() {
                  //console.log("HTML5 audio: canplay");
                   myAudioChannel1.play();
                 }
              , false);

              // playing vs play
              myAudioChannel1.addEventListener('playing', 
                function() {
                   //console.log("HTML5 audio: play");
                   /*

                   since v0.5, use timeupdate workaround  for Android
                   ( http://stackoverflow.com/questions/23291565/html5-audio-start-playing-delay )
                   if(myAudioChannel1playingCallback!=null)
                    myAudioChannel1playingCallback();
                  */
                 }
              , false);

              myAudioChannel1.addEventListener('pause', 
                function() {
                   //console.log("HTML5 audio: pasue");
                   isPlayingCallbackTriggered=false;
                 }
              , false);

              myAudioChannel1.addEventListener('error', 
                function() {
                   //console.log("HTML5 audio: error");
                   if(myAudioChannel1errCallback!=null)
                        myAudioChannel1errCallback();
                 }
              , false);

              myAudioChannel1.addEventListener('ended', 
                function() {
                   //console.log("HTML5 audio: ended");
                   if(myAudioChannel1endedCallback!=null)
                        myAudioChannel1endedCallback();
                 }
              , false);

              myAudioChannel1.addEventListener('timeupdate', 
                function() {
                   //console.log("HTML5 audio: timeupdate");

                   if(isPlayingCallbackTriggered==false && myAudioChannel1.currentTime>0)
                   {
                      isPlayingCallbackTriggered=true;

                      if(myAudioChannel1playingCallback!=null)
                        myAudioChannel1playingCallback();

                   }

                   if(myAudioChannel1timeupdateCallback!=null)
                        myAudioChannel1timeupdateCallback();
                 }
              , false);
          }
         
        /*
        if(  myAudioChannel1.readyState>1 && myAudioChannel1.paused==false )
        {
          myAudioChannel1.src = URL.createObjectURL(new Blob([]), {type:"audio/mp3"});
          myAudioChannel1.load();

        }
        */

         myAudioChannel1.src = url;

         isPlayingCallbackTriggered=false;

         myAudioChannel1playingCallback = onplayfunction;
         myAudioChannel1errCallback = onerrfunction;

         myAudioChannel1endedCallback = onendedfunction;
         myAudioChannel1timeupdateCallback = ontimeupdatefunction;

         myAudioChannel1.load();

         //console.log("HTML5 audio: call load="+myAudioChannel1.src);
      }


      // API: audioPlayChannel02
      this.audioPlayChannel02 = function()
      {   
         if(myAudioChannel2 == null)
              myAudioChannel2 = document.getElementById("audioChannel02");

          myAudioChannel2.play();
      }


      // API function: audioStop
     this.audioStop = function ()
     {
            if(myAudioChannel1 !=null )
            {
               if(myAudioChannel1.readyState>1 && myAudioChannel1.paused==false)
               {
                 //myAudioChannel1.currentTime=0;
                 
                 myAudioChannel1.pause();
               }
               else
               {
                 
                 myAudioChannel1.pause();

               }
             }

            if(myAudioChannel2 !=null )
            {
               if(myAudioChannel2.readyState>1 && myAudioChannel2.paused==false)
               {

                 myAudioChannel2.currentTime=0;
                 myAudioChannel2.pause();
               }
               else
               {
                 myAudioChannel2.pause();
               }
             }
      }


      this.audioResumePlay = function(k)
     {
        if(myAudioChannel1 != null && myAudioChannel1.readyState>1 && myAudioChannel1.paused==true)
        {
            if(k==0)
            {
                myAudioChannel1.currentTime=0;
            }

            if(myAudioChannel1.currentTime == myAudioChannel1.duration)
              myAudioChannel1.currentTime = 0;

            myAudioChannel1.play();
        }

     }

     this.audioSeek = function(k)
     {

         myAudioChannel1.currentTime = myAudioChannel1.duration * k;

     }

     this.getAudioCurrentTime = function()
     {
         if(myAudioChannel1!=null)
           return myAudioChannel1.currentTime;
         else
          return 0;

     }

     this.getAudioDuration = function()
     {

         if(myAudioChannel1!=null)
            return myAudioChannel1.duration;
        else
          return 0;

     }

      this.makeId = function (n)
      {
          var text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

          for( var i=0; i < n; i++ )
              text += possible.charAt(Math.floor(Math.random() * possible.length));

          return text;
      }


  }

  // load library
  var viaductEssentailAPI = new viaductEssentail();


  