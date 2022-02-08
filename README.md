# PSPDFKit for Web Examples Catalog

## Prerequisites

We recommend you use Docker to get all components up and running quickly.

- [Docker](https://www.docker.com/community-edition)

You can easily run the catalog in trial mode without need for a license or activation key. Just make sure to check out this repository locally. The provided `docker-compose.yml` and `Dockerfile` will allow you to edit the example app on your host, and it will live-reload:

```sh
$ git clone https://github.com/PSPDFKit/pspdfkit-web-examples-catalog.git
$ cd pspdfkit-web-examples-catalog
$ docker-compose up
```

The examples catalog is now running on [http://localhost:3000](http://localhost:3000). You can access the PSPDFKit Server dashboard at [http://localhost:5000/dashboard](http://localhost:5000/dashboard) using `dashboard` // `secret`.

## Using a license

If you have a PSPDFKit for Web license you can use it as well by going through the following steps:

1. Open the [`docker-compose.yml`](docker-compose.yml) file in an editor of your choice and replace the `YOUR_LICENSE_KEY_GOES_HERE` placeholder with your standalone license key.

2. Start environment with your PSPDFKit Server activation key:

```sh
$ ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE docker-compose up
```

If you are using Windows make sure to set the environment variables accordingly. For this replace the line starting with `ACTIVATION_KEY="...` with:

```shell
$ SET "ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE"
$ docker-compose up
```

Make sure to replace `YOUR_ACTIVATION_KEY_GOES_HERE` with your PSPDFKit Server activation key. You only have to provide the activation key once, after that the server will remain activated until you reset it.

### Resetting the environment

You can reset the environment by first tearing down its containers and volumes and then recreating them.

```sh
$ docker-compose down --volumes
$ docker-compose up
```

If using an activation key, you'd need to set it again so as to recreate the containers:

```sh
$ docker-compose down --volumes
$ ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE docker-compose up
```

If you are using Windows make sure to set the environment variables accordingly. For this replace the line starting with `ACTIVATION_KEY="...` with:

```shell
$ SET "ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE"
$ docker-compose up
```

## Notes

If an example sets options within `PSPDFKit.Options`, the page should be
refreshed when switching to/from the example, since `PSPDFKit.load()` freezes
the options object. Currently only the Form Designer example does this, but if
any others qualify, the `refreshExamples` constant should be updated at
`_app.js:10`.

## Troubleshooting

Occasionally running the `docker-compose` scripts will result in errors because some containers are in a broken state. To resolve this, you can reset all containers and their attached volumes by running the following command:

```sh
docker-compose down --volumes
```

If you have further troubles, you can always reach out to us via our [support platform](https://pspdfkit.com/support/request).

## Upload a new pdf file to the catalog examples

To upload a pdf to our catalog we need to update the examples in the Web Repo.
Each example uses an `example.pdf` included in the same folder. In order to change it, you only need to name the new PDF `example.pdf` and replace (or rename) the old one.

## Forcing a specific backend

Regardless of the current backend chosen, you can force a specific backend to be selected when accessing the catalog by following a URL by appending the `mode` query param and setting it to either `"standalone"` or `"server"`, for example: [https://web-examples.pspdfkit.com/hello?mode=standalone](https://web-examples.pspdfkit.com/hello?mode=standalone) will open the Standalone version of the `hello` example, even if the default backend is Server.

## Support, Issues and License Questions

PSPDFKit offers support for customers with an active SDK license via https://pspdfkit.com/support/request/

Are you [evaluating our SDK](https://pspdfkit.com/try/)? That's great, we're happy to help out! To make sure this is fast, please use a work email and have someone from your company fill out our sales form: https://pspdfkit.com/sales/

## License

This software is licensed under a [modified BSD license](LICENSE).

## Contributing

Please ensure [you signed our CLA](https://pspdfkit.com/guides/web/current/miscellaneous/contributing/) so we can accept your contributions.
