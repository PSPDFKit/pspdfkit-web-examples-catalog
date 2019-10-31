# PSPDFKit for Web Examples Catalog

## Prerequisites

- A PSPDFKit for Web license. If you don't already have one you can [request a free trial here](https://pspdfkit.com/try/).

Before you get started, make sure to check out this repository locally:

```sh
$ git clone https://github.com/PSPDFKit/pspdfkit-web-examples-catalog.git
$ cd pspdfkit-web-examples-catalog
```

## Getting Started with Docker

### Prerequisites

- [Docker](https://www.docker.com/community-edition)

We recommend you use Docker to get all components up and running quickly.

The provided `docker-compose.yml` and `Dockerfile` will allow you to edit the example app on your
host and it will live-reload.

1. Open the [`docker-compose.yml`](docker-compose.yml) file in an editor of your choice and replace the `YOUR_LICENSE_KEY_GOES_HERE` placeholder with your standalone license key.

2. Start environment with your PSPDFKit Server activation key.

   ```sh
   $ ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE docker-compose up
   ```

   If you are using Windows make sure to set the environment variables accordingly. For this replace the line starting with `ACTIVATION_KEY="...` with:

   ```shell
   $ SET "ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE"
   $ docker-compose up
   ```

   Make sure to replace `YOUR_ACTIVATION_KEY_GOES_HERE` with your PSPDFKit Server activation key. You only have to provide the activation key once, after that the server will remain activated until you reset it.

3. The examples catalog is now running on [http://localhost:3000](http://localhost:3000). You can access the PSPDFKit Server dashboard at [http://localhost:5000/dashboard](http://localhost:5000/dashboard) using `dashboard` // `secret`.

### Resetting the environment

You can reset the environment by first tearing down its containers and volumes and then recreating them.

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

## License

This software is licensed under a [modified BSD license](LICENSE).

## Contributing

Please ensure [you signed our CLA](https://pspdfkit.com/guides/web/current/miscellaneous/contributing/) so we can accept your contributions.
