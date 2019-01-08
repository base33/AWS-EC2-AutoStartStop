const AWS = require('aws-sdk');

exports.handler = async (event, context, callback) => {
	
	console.log("Running schedule: " + event.Schedule);
	
	await actionAllInstancesByScheduleName(event.Schedule, event.Action);
};

async function actionAllInstancesByScheduleName(scheduleName, action) {
	
	var currentInstanceState = action == "Start" ? "stopped" : "running";
	
    var instancesData = await getInstances(scheduleName, currentInstanceState);
    
    var instanceIds = [];
    instancesData.Reservations.forEach(reservation => {
        reservation.Instances.forEach(instance => {
            instanceIds.push(instance.InstanceId);
        });
    });
    
    console.log(instanceIds);
    
    if(action == "Start") {
    	await startInstances(instanceIds);
    }
    else if(action == "Stop") {
    	await stopInstances(instanceIds);
    }
}

async function getInstances(scheduleName, instanceState) {
	var EC2 = new AWS.EC2();
	
	var params = {
		Filters: [
			{
			Name: 'instance-state-name',
			Values: [
            	instanceState
        	],
		},
		{
			Name: 'tag:Schedule',
			Values: [
                scheduleName
        	]
    	}]
	};
		
	return new Promise(function (resolve, reject) {
		EC2.describeInstances(params, function (err, data) {
			if (err) reject(err);
			else resolve(data);
		});
	});
}

async function startInstances(instanceIds) {
	var EC2 = new AWS.EC2();
	var Ids = {
		InstanceIds: instanceIds
	};
	return new Promise(function (resolve, reject) {
		EC2.startInstances(Ids, function (err, data) {
			if (err) reject(err);
			else resolve(data);
		});
	});
}

async function stopInstances(instanceIds) {
	var EC2 = new AWS.EC2();
	var Ids = {
		InstanceIds: instanceIds
	};
	return new Promise(function (resolve, reject) {
		EC2.stopInstances(Ids, function (err, data) {
			if (err) reject(err);
			else resolve(data);
		});
	});
}
