systems({
	nginx: {
		depends: ['hhvm'],
		image: {docker: 'nginx:latest'},
		workdir: '/azk/#{manifest.dir}',
		shell: '/bin/bash',
		command: './nginx/start.sh',
		wait: 20,
		mounts: {
			'/azk/#{manifest.dir}/nginx': path('nginx'),
			'/var/www': path('nginx/www'),
			'/etc/nginx/conf.d': path('nginx/conf.d')
		},
		scalable: {default: 1},
		http: {
			domains: [
				'hhvm.dev.azk.io'
			]
		},
		ports: {
			http: '80/tcp',
		}
	},
	hhvm: {
		depends: [],
		image: {docker: 'diegomarangoni/hhvm'},
		workdir: '/azk/#{manifest.dir}',
		shell: '/bin/bash',
		command: 'hhvm --mode server -vServer.Type=fastcgi -vServer.Port=9000',
		wait: 20,
		mounts: {
			'/var/www': path('nginx/www'),
		},
		scalable: {default: 1},
		ports: {
			fastcgi: '9000:9000/tcp',
		},
		export_envs: {
			FASTCGI_HOST: '#{net.host}',
			FASTCGI_PORT: '#{net.port.fastcgi}'
		}
	}
});

setDefault('nginx');
