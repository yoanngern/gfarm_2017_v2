<?php get_header( 'events' ); ?>


<section id="content" class="events">

    <div class="platter">


		<?php

		get_gfarm_events_by_cat('evenement');


		if ( have_posts() ) : ?>

            <header>

                <h1><?php pll_e( 'Prochains événements' ); ?></h1>

            </header>


            <section id="listOfEvents" class="small" data-nb="3">
                <article class="content-page">


					<?php

					/* Start the Loop */
					while ( have_posts() ) :
						the_post();

						get_template_part( 'template-parts/event/item' );

					endwhile; ?>

                </article>
            </section>


            <nav class="nav_bottom">
                <div class="nav-previous alignleft"><?php previous_posts_link( 'Previous' ); ?></div>
                <div class="nav-next alignright"><?php next_posts_link( 'Next' ); ?></div>
            </nav>

			<?php

		endif;
		?>





		<?php

		get_gfarm_events_by_cat('brunch');


		if ( have_posts() ) : ?>

            <header>

                <h1><?php pll_e( 'Brunch' ); ?></h1>

            </header>


            <section id="listOfEvents" class="small" data-nb="3">
                <article class="content-page">


					<?php

					/* Start the Loop */
					while ( have_posts() ) :
						the_post();

						get_template_part( 'template-parts/event/item' );

					endwhile; ?>

                </article>
            </section>


            <nav class="nav_bottom">
                <div class="nav-previous alignleft"><?php previous_posts_link( 'Previous' ); ?></div>
                <div class="nav-next alignright"><?php next_posts_link( 'Next' ); ?></div>
            </nav>

			<?php

		endif;
		?>

    </div>

</section>

<?php get_footer(); ?>



