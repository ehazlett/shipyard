#How to test the clair functionality

There are two routes which end up invoking clair:
- `/api/test_image/{id}`
  this route invokes clair to test a single image, where {id} is the image id.
- `/api/test_images/{project_id}`
  this route invokes clair to test all the images in a project, where {project_id} is the id of the project you want to test.

  Both routes are called through POST, in a standard http request. `test_image` returns either a report of the vulnerabilities in json format, or a message explaining that clair cannot test the image, or an interal server error message in case of a critical error. `test_images` returns an array of reports of the vulnerabilities of the images in json format, or a message explaining that clair cannot test the image, or an internal server error.

To test a single image:
- get a shipyard token
- create an image
- hit the test_image route to test your image

To test all the images in a project:
- get a shipyard token
- create a project
- add images to your project
- hit the test_images route to test all images in your project
