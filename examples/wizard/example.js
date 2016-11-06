
$(document).on('ready', function(){
	var $testWizard = $('#testWizard');
	var w = new Wizard({
		validator : Wizard.validators.formValidation,
		template : $testWizard,
		useTemplate : true
	});
	$testWizard.find('[name="name"]').val('bob');
	$testWizard.find('[name="age"]').val('55');
	$testWizard.find('[name="gender"]').val('1');
});
