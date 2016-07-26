<?php

namespace Proservia\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

/**
 * Class SiteType
 * @package Proservia\CoreBundle\Form
 */
class SiteType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('id', HiddenType::class, array(
                'label' => 'id',
            ))
            ->add('name', TextType::class, array(
                'label' => 'Nom',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un nom',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('shortName', TextType::class, array(
                'label' => 'Raccourci',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un nom court',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('adresse', TextType::class, array(
                'label' => 'Adresse',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir une adresse',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('codePostal', TextType::class, array(
                'label' => 'Code Postal',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un Code Postal',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('ville', TextType::class, array(
                'label' => 'Ville',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir une Ville',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('mainPhone')
            ->add('specialComment', TextareaType::class, array(
                'label' => 'Commentaire',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un Comentaire',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('contact')
        ;
    }
    
    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Proservia\CoreBundle\Entity\Site'
        ));
    }
}
