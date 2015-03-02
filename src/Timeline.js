Pk.Timeline = (function(){
	
	var current_time = 0;
	var IntervalQuery =  null;
	var AllClips = [];
	var isBuilt = false;
	var playMode = true;
	
	var IntervalsInCurrentFrame = {};
	
	//TODO (OS): Create lookahead

	var HandleClipsInRange = function(interval_list){
		/* 
		 * In set language:
		 * for insertion  = in \ current
		 * for removal = current \ in
		 * but js doesn't have set algebra,
		 * so we use IDs instead.
		 */
		var ClipsForRemoval = [];	
		//Find set difference and set excluded cilps for removal
		Object.keys(IntervalsInCurrentFrame).forEach(
			function(key){
				if (!Pk.Util.Exists(interval_list[key])){
					//Doesn't exist? mark for deletion
					var removed = IntervalsInCurrentFrame[key];
					delete IntervalsInCurrentFrame[key];
					ClipsForRemoval.push(removed.clip);
				} else {
					//Does exist? Keep it playing
					delete interval_list[key];
				}	
			});

		//First, clean up.
		HandleRemovedClips(ClipsForRemoval);

		// The keys that weren't plucked from interval_list are new. Insert them into the scene.
		HandleNewClips(Object.keys(interval_list).map(
			function(key){ return interval_list[key].clip; })
		);

		//Finally, add the new clips to the "currently playing" set.
		Object.keys(interval_list).forEach(
			function(key){ IntervalsInCurrentFrame[key] = interval_list[key]; }
			);
	};

	var HandleNewClips = function(clips){
		// TODO: Implement
		clips.forEach(function(clip){console.log("adding: " + clip.interval.id);})
	};
	var HandleRemovedClips = function(clips){
		// TODO: Implement
		clips.forEach(function(clip){console.log("removing: " + clip.interval.id);})
	};

	return {

		BindTimecodeController : function(controller){
			//FIXME:This way one can subscribe to multiple controllers
			controller.Subscribe(this.SetTimecode.bind(this));
		},
		
		SetTimecode : function(time, sweep){
			if (!Pk.Util.Exists(sweep)){
				sweep = true;
			}
			if (sweep){
				//TODO: Maybe play next frame, not current?
				var opts = {
					resultFn : HandleClipsInRange.bind(this)
				};
				IntervalQuery.queryInterval(current_time, time, opts);
	 		}
			current_time = time;
		},


		/*
		 * Must be called before the timeline is functional
		 * Due to using static tree, no more additions can be made
		 * after calling this. This can be switched by a dynamic
		 * interval query, like in here:
		 * https://github.com/toberndo/interval-query
		 */
		Build : function(){
			IntervalQuery = new Pk.IntervalTree();
			AllClips.forEach(
				function(clip){
					IntervalQuery.pushInterval(clip.interval);
				});
			IntervalQuery.buildTree();
			isBuilt = true;
		},

		/*
	     * Adds any number of clips to the timeline
	     */
		Add : function(){
			if (isBuilt === true){ 
				console.warn("Trying to add clips to a built timeline");
				return;
			}
			for (var i = arguments.length - 1; i >= 0; i--) {
				AllClips.push(arguments[i]);
			};
		},


		SetPlayMode : function(status) {
			if ((status !== true) && (status !== false)){
				return;
			} else {
				playMode = status;
			}
		}

	}
	

})();




	

